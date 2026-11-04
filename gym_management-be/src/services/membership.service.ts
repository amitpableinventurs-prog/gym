import mongoose from "mongoose";
import { IMembership, Membership } from "../models/Membership";
import { MembershipPlan } from "../models/MembershipPlan";
import { Payment } from "../models/Payment";
import User from "../models/User";
import { Workout } from "../models/workout.model";
import { addDays, DAY_MS, daysBetween, parseWorkoutStart } from "../utils/dates";
import { HttpError, isDuplicateKeyError } from "../utils/httpError";
import { PaymentInput, recordMembershipPayment } from "./payment.service";

type DisplayStatus = IMembership["status"] | "EXPIRED" | "UPCOMING";

export const displayStatus = (membership: IMembership, now = new Date()): DisplayStatus => {
  if (membership.status !== "ACTIVE") return membership.status;
  if (membership.endDate && membership.endDate < now) return "EXPIRED";
  if (membership.startDate && membership.startDate > now) return "UPCOMING";
  return "ACTIVE";
};

export const presentMembership = (membership: IMembership, now = new Date()) => {
  const status = displayStatus(membership, now);
  return {
    id: String(membership._id),
    planId: String(membership.planId),
    planName: membership.planName,
    price: membership.price,
    durationDays: membership.durationDays,
    status,
    startDate: membership.startDate ?? null,
    endDate: membership.endDate ?? null,
    frozenAt: membership.frozenAt ?? null,
    frozenDays: membership.frozenDays,
    sessionLimit: membership.sessionLimit,
    sessionsUsed: membership.sessionsUsed,
    sessionsRemaining:
      membership.sessionLimit === null
        ? null
        : Math.max(membership.sessionLimit - membership.sessionsUsed, 0),
    daysRemaining:
      status === "ACTIVE" && membership.endDate
        ? Math.max(daysBetween(now, membership.endDate), 0)
        : null,
    cancelReason: membership.cancelReason ?? null,
    createdAt: membership.createdAt,
  };
};

/** The membership that covers the member right now, including a frozen one. */
export const getCurrentMembership = async (userId: string, now = new Date()) =>
  Membership.findOne({
    userId,
    $or: [
      { status: "FROZEN" },
      { status: "ACTIVE", startDate: { $lte: now }, endDate: { $gte: now } },
    ],
  }).sort({ startDate: 1 });

export const getMemberSummary = async (userId: string) => {
  const now = new Date();
  const memberships = await Membership.find({ userId }).sort({ createdAt: -1 });
  const current = await getCurrentMembership(userId, now);
  const pending = memberships.find((item) => item.status === "PENDING");
  const upcoming = memberships
    .filter((item) => displayStatus(item, now) === "UPCOMING")
    .sort((a, b) => (a.startDate as Date).getTime() - (b.startDate as Date).getTime());

  return {
    current: current ? presentMembership(current, now) : null,
    pending: pending ? presentMembership(pending, now) : null,
    upcoming: upcoming.map((item) => presentMembership(item, now)),
    history: memberships.map((item) => presentMembership(item, now)),
  };
};

const createPending = async (userId: string, planId: string): Promise<IMembership> => {
  const [user, plan] = await Promise.all([
    User.findById(userId).select("isCoach isAdmin"),
    MembershipPlan.findOne({ _id: planId, isActive: true }),
  ]);
  if (!user) throw new HttpError(404, "Member not found");
  if (!plan) throw new HttpError(404, "This plan is not available");
  if (user.isCoach || user.isAdmin) {
    throw new HttpError(400, "Memberships are for client accounts only");
  }

  try {
    return await Membership.create({
      userId,
      planId,
      planName: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      sessionLimit: plan.sessionLimit,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, "There is already a membership request waiting for payment");
    }
    throw error;
  }
};

export const requestMembership = (userId: string, planId: string) =>
  createPending(userId, planId);

export const withdrawRequest = async (userId: string, membershipId: string) => {
  const membership = await Membership.findOneAndUpdate(
    { _id: membershipId, userId, status: "PENDING" },
    { status: "CANCELLED", cancelledAt: new Date(), cancelReason: "Withdrawn by member" },
    { new: true }
  );
  if (!membership) throw new HttpError(404, "No pending request found");
  return presentMembership(membership);
};

/** A renewal starts when the member's paid time runs out, so no days are lost. */
const nextStartDate = async (userId: mongoose.Types.ObjectId, now: Date): Promise<Date> => {
  const latest = await Membership.findOne({
    userId,
    status: { $in: ["ACTIVE", "FROZEN"] },
    endDate: { $gt: now },
  }).sort({ endDate: -1 });
  return latest?.endDate ?? now;
};

export const activateMembership = async (
  membershipId: string,
  payment: PaymentInput,
  adminId: string
) => {
  const pending = await Membership.findOne({ _id: membershipId, status: "PENDING" });
  if (!pending) throw new HttpError(409, "Only a pending membership can be activated");

  const now = new Date();
  const startDate = await nextStartDate(pending.userId, now);
  const endDate = addDays(startDate, pending.durationDays);

  // The status guard makes a double click activate (and charge) only once.
  const membership = await Membership.findOneAndUpdate(
    { _id: membershipId, status: "PENDING" },
    { status: "ACTIVE", startDate, endDate },
    { new: true }
  );
  if (!membership) throw new HttpError(409, "Only a pending membership can be activated");

  try {
    const receipt = await recordMembershipPayment(membership, payment, adminId);
    return { membership: presentMembership(membership, now), payment: receipt };
  } catch (error) {
    await Membership.updateOne(
      { _id: membership._id },
      { status: "PENDING", $unset: { startDate: 1, endDate: 1 } }
    );
    throw error;
  }
};

export const assignMembership = async (
  userId: string,
  planId: string,
  payment: PaymentInput,
  adminId: string
) => {
  const pending = await createPending(userId, planId);
  return activateMembership(String(pending._id), payment, adminId);
};

/** Cancels future sessions charged to a membership and gives the sessions back. */
const cancelUpcomingSessions = async (membershipId: unknown, now: Date) => {
  const scheduled = await Workout.find({ membershipId, status: "SCHEDULED" });
  const upcoming = scheduled.filter((workout) => {
    const start = parseWorkoutStart(workout.date, workout.time);
    return start !== null && start > now;
  });
  if (!upcoming.length) return 0;

  await Workout.updateMany(
    { _id: { $in: upcoming.map((workout) => workout._id) } },
    { status: "CANCELLED" }
  );
  await Membership.updateOne({ _id: membershipId }, [
    { $set: { sessionsUsed: { $max: [{ $subtract: ["$sessionsUsed", upcoming.length] }, 0] } } },
  ]);
  return upcoming.length;
};

export const freezeMembership = async (membershipId: string) => {
  const now = new Date();
  const membership = await Membership.findOneAndUpdate(
    { _id: membershipId, status: "ACTIVE", startDate: { $lte: now }, endDate: { $gte: now } },
    { status: "FROZEN", frozenAt: now },
    { new: true }
  );
  if (!membership) throw new HttpError(409, "Only a running membership can be frozen");

  const cancelledSessions = await cancelUpcomingSessions(membership._id, now);
  const fresh = (await Membership.findById(membership._id)) as IMembership;
  return { membership: presentMembership(fresh, now), cancelledSessions };
};

export const unfreezeMembership = async (membershipId: string) => {
  const now = new Date();
  const frozen = await Membership.findOne({ _id: membershipId, status: "FROZEN" });
  if (!frozen) throw new HttpError(409, "This membership is not frozen");

  // The member gets the exact paused time back, and any queued renewal moves with them.
  const pausedMs = Math.max(now.getTime() - (frozen.frozenAt as Date).getTime(), 0);
  const shift = (date: Date) => new Date(date.getTime() + pausedMs);
  const previousEnd = frozen.endDate as Date;
  const membership = await Membership.findOneAndUpdate(
    { _id: membershipId, status: "FROZEN" },
    {
      status: "ACTIVE",
      endDate: shift(previousEnd),
      $inc: { frozenDays: Math.round(pausedMs / DAY_MS) },
      $unset: { frozenAt: 1 },
    },
    { new: true }
  );
  if (!membership) throw new HttpError(409, "This membership is not frozen");

  const queued = await Membership.find({
    userId: membership.userId,
    status: "ACTIVE",
    _id: { $ne: membership._id },
    startDate: { $gte: previousEnd },
  });
  await Promise.all(
    queued.map((item) => {
      item.startDate = shift(item.startDate as Date);
      item.endDate = shift(item.endDate as Date);
      return item.save();
    })
  );

  return presentMembership(membership, now);
};

export const cancelMembership = async (membershipId: string, reason: string) => {
  const now = new Date();
  const membership = await Membership.findOneAndUpdate(
    { _id: membershipId, status: { $in: ["PENDING", "ACTIVE", "FROZEN"] } },
    { status: "CANCELLED", cancelledAt: now, cancelReason: reason, $unset: { frozenAt: 1 } },
    { new: true }
  );
  if (!membership) throw new HttpError(409, "This membership is already cancelled");

  const cancelledSessions = await cancelUpcomingSessions(membership._id, now);
  return { membership: presentMembership(membership, now), cancelledSessions };
};

/**
 * Charges one session to the membership that covers the session date.
 * Throws a coded 403 the client can turn into a "get a membership" prompt.
 */
export const reserveSession = async (userId: string, sessionStart: Date) => {
  const covering = {
    userId,
    status: "ACTIVE",
    startDate: { $lte: sessionStart },
    endDate: { $gte: sessionStart },
  };

  const membership = await Membership.findOneAndUpdate(
    {
      ...covering,
      $or: [{ sessionLimit: null }, { $expr: { $lt: ["$sessionsUsed", "$sessionLimit"] } }],
    },
    { $inc: { sessionsUsed: 1 } },
    { new: true, sort: { startDate: 1 } }
  );
  if (membership) return membership;

  if (await Membership.exists(covering)) {
    throw new HttpError(
      403,
      "You have used all the sessions included in your plan",
      "SESSION_LIMIT_REACHED"
    );
  }
  if (await Membership.exists({ userId, status: "FROZEN" })) {
    throw new HttpError(403, "Your membership is frozen", "MEMBERSHIP_FROZEN");
  }
  if (await getCurrentMembership(userId)) {
    throw new HttpError(
      403,
      "Your membership does not cover the selected date",
      "MEMBERSHIP_DATE_NOT_COVERED"
    );
  }
  throw new HttpError(
    403,
    "An active membership is required to book a session",
    "MEMBERSHIP_REQUIRED"
  );
};

export const releaseSession = async (membershipId?: unknown) => {
  if (!membershipId) return;
  await Membership.updateOne(
    { _id: membershipId, sessionsUsed: { $gt: 0 } },
    { $inc: { sessionsUsed: -1 } }
  );
};

export const getMemberPayments = (userId: string) =>
  Payment.find({ userId }).sort({ paidAt: -1 }).limit(100).lean();
