import { Request, Response } from "express";
import { z } from "zod";
import { Attendance } from "../models/Attendance";
import { IMembership, Membership, MEMBERSHIP_STATUSES } from "../models/Membership";
import { MembershipPlan } from "../models/MembershipPlan";
import { Payment } from "../models/Payment";
import { ITestimonialDoc, Testimonial } from "../models/Testimonial";
import User from "../models/User";
import { Workout } from "../models/workout.model";
import { checkIn, checkOut } from "../services/attendance.service";
import {
  activateMembership,
  assignMembership,
  cancelMembership,
  freezeMembership,
  getMemberPayments,
  getMemberSummary,
  presentMembership,
  unfreezeMembership,
} from "../services/membership.service";
import { refundPayment } from "../services/payment.service";
import { workoutService } from "../services/workout.service";
import { addDays, startOfDay } from "../utils/dates";
import { HttpError, isDuplicateKeyError } from "../utils/httpError";
import {
  escapeRegex,
  objectId,
  paginationSchema,
  paymentSchema,
  reasonSchema,
} from "../utils/validation";

const EXPIRY_WARNING_DAYS = 7;
const REVENUE_MONTHS = 6;
const NAME_FIELDS = "firstName lastName email";

const planSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).default(""),
  price: z.number().int().min(0),
  durationDays: z.number().int().min(1).max(1825),
  sessionLimit: z.number().int().min(1).nullable().default(null),
  features: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
  isActive: z.boolean().default(true),
});

const memberListSchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  role: z.enum(["client", "coach"]).optional(),
  membership: z.enum(["active", "none"]).optional(),
});

const membershipListSchema = paginationSchema.extend({
  status: z.enum([...MEMBERSHIP_STATUSES, "EXPIRED", "EXPIRING"]).optional(),
});

const paymentListSchema = paginationSchema.extend({
  status: z.enum(["PAID", "REFUNDED"]).optional(),
});

const bookingListSchema = paginationSchema.extend({
  status: z.string().regex(/^[A-Z_]+$/).optional(),
});

const attendanceListSchema = paginationSchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const runningFilter = (now: Date) => ({
  status: "ACTIVE",
  startDate: { $lte: now },
  endDate: { $gte: now },
});

const revenueByMonth = async (now: Date) => {
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - (REVENUE_MONTHS - 1), 1);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const totals = await Payment.aggregate<{ _id: { year: number; month: number }; total: number }>([
    { $match: { status: "PAID", paidAt: { $gte: firstMonth } } },
    {
      $group: {
        _id: {
          year: { $year: { date: "$paidAt", timezone } },
          month: { $month: { date: "$paidAt", timezone } },
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  return Array.from({ length: REVENUE_MONTHS }, (_, index) => {
    const month = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    const match = totals.find(
      (item) => item._id.year === month.getFullYear() && item._id.month === month.getMonth() + 1
    );
    return {
      month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
      total: match?.total ?? 0,
    };
  });
};

const populatedMember = (membership: IMembership) => {
  const member = membership.userId as unknown as {
    _id: unknown;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  return member
    ? { id: String(member._id), firstName: member.firstName, lastName: member.lastName, email: member.email }
    : null;
};

class AdminController {
  public async getOverview(_req: Request, res: Response): Promise<void> {
    const now = new Date();
    const expiryCutoff = addDays(now, EXPIRY_WARNING_DAYS);
    const today = startOfDay(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      coaches,
      clients,
      totalWorkouts,
      recentUsers,
      recentWorkouts,
      testimonialDocuments,
      activeMemberIds,
      pendingRequests,
      expiring,
      queuedRenewals,
      checkInsToday,
      insideNow,
      monthRevenue,
      revenue,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: { $ne: true } }),
      User.countDocuments({ isCoach: true, isAdmin: { $ne: true } }),
      User.countDocuments({ isCoach: false, isAdmin: { $ne: true } }),
      Workout.countDocuments(),
      User.find({ isAdmin: { $ne: true } })
        .select("firstName lastName email isCoach createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Workout.find()
        .sort({ _id: -1 })
        .limit(5)
        .populate("userId", "firstName lastName")
        .populate("coachId", "firstName lastName")
        .lean(),
      Testimonial.find().lean(),
      Membership.distinct("userId", runningFilter(now)),
      Membership.countDocuments({ status: "PENDING" }),
      Membership.find({ ...runningFilter(now), endDate: { $gte: now, $lte: expiryCutoff } })
        .sort({ endDate: 1 })
        .populate("userId", NAME_FIELDS),
      Membership.distinct("userId", { status: "ACTIVE", startDate: { $gt: now } }),
      Attendance.countDocuments({ checkInAt: { $gte: today } }),
      Attendance.countDocuments({ isOpen: true, checkInAt: { $gte: today } }),
      Payment.aggregate<{ total: number }>([
        { $match: { status: "PAID", paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      revenueByMonth(now),
    ]);

    const totalTestimonials = testimonialDocuments
      .flatMap((document) => Object.values(document))
      .reduce(
        (count, value) => count + (Array.isArray(value) ? value.length : 0),
        0
      );

    // A member who has already renewed does not need chasing.
    const renewed = new Set(queuedRenewals.map(String));
    const expiringSoon = expiring.filter((item) => {
      const member = item.userId as unknown as { _id: unknown } | null;
      return member && !renewed.has(String(member._id));
    });

    res.status(200).json({
      metrics: {
        totalUsers,
        coaches,
        clients,
        totalWorkouts,
        totalTestimonials,
        activeMembers: activeMemberIds.length,
        pendingRequests,
        expiringSoon: expiringSoon.length,
        checkInsToday,
        insideNow,
        revenueThisMonth: monthRevenue[0]?.total ?? 0,
      },
      revenueByMonth: revenue,
      expiringMemberships: expiringSoon.slice(0, 5).map((item) => ({
        ...presentMembership(item, now),
        member: populatedMember(item),
      })),
      recentUsers,
      recentWorkouts,
    });
  }

  public async listMembers(req: Request, res: Response): Promise<void> {
    const { page, limit, search, role, membership } = memberListSchema.parse(req.query);
    const now = new Date();

    const filter: Record<string, unknown> = { isAdmin: { $ne: true } };
    if (role) filter.isCoach = role === "coach";
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ firstName: pattern }, { lastName: pattern }, { email: pattern }];
    }
    if (membership) {
      const activeIds = await Membership.distinct("userId", runningFilter(now));
      filter._id = membership === "active" ? { $in: activeIds } : { $nin: activeIds };
      if (membership === "none") filter.isCoach = false;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("firstName lastName email isCoach isSuspended suspensionReason createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const ids = users.map((user) => user._id);
    const [memberships, openVisits] = await Promise.all([
      Membership.find({
        userId: { $in: ids },
        $or: [{ status: "FROZEN" }, runningFilter(now)],
      }),
      Attendance.find({ userId: { $in: ids }, isOpen: true, checkInAt: { $gte: startOfDay(now) } })
        .select("userId")
        .lean(),
    ]);

    const inside = new Map(openVisits.map((visit) => [String(visit.userId), String(visit._id)]));
    res.json({
      total,
      page,
      limit,
      items: users.map((user) => {
        const current = memberships.find((item) => String(item.userId) === String(user._id));
        return {
          ...user,
          membership: current ? presentMembership(current, now) : null,
          openVisitId: inside.get(String(user._id)) ?? null,
        };
      }),
    });
  }

  public async getMember(req: Request, res: Response): Promise<void> {
    const userId = objectId.parse(req.params.userId);
    const user = await User.findById(userId)
      .select("firstName lastName email isCoach isAdmin isSuspended suspensionReason target activity createdAt")
      .lean();
    if (!user) throw new HttpError(404, "Member not found");

    const [memberships, payments, visits, sessions] = await Promise.all([
      getMemberSummary(userId),
      getMemberPayments(userId),
      Attendance.find({ userId }).sort({ checkInAt: -1 }).limit(10).lean(),
      Workout.countDocuments({ userId }),
    ]);
    res.json({ user, memberships, payments, visits, sessions });
  }

  public async setSuspension(req: Request, res: Response): Promise<void> {
    const userId = objectId.parse(req.params.userId);
    const { suspended, reason } = z
      .object({ suspended: z.boolean(), reason: z.string().trim().max(300).optional() })
      .parse(req.body);

    const target = await User.findById(userId).select("isAdmin");
    if (!target) throw new HttpError(404, "Member not found");
    if (target.isAdmin) throw new HttpError(400, "Administrator accounts cannot be suspended");

    await User.updateOne(
      { _id: userId },
      suspended
        ? { isSuspended: true, suspensionReason: reason }
        : { isSuspended: false, $unset: { suspensionReason: 1 } }
    );
    res.json({ id: userId, isSuspended: suspended });
  }

  public async listPlans(_req: Request, res: Response): Promise<void> {
    res.json(await MembershipPlan.find().sort({ isActive: -1, price: 1 }).lean());
  }

  public async createPlan(req: Request, res: Response): Promise<void> {
    try {
      res.status(201).json(await MembershipPlan.create(planSchema.parse(req.body)));
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new HttpError(409, "A plan with this name already exists");
      throw error;
    }
  }

  public async updatePlan(req: Request, res: Response): Promise<void> {
    const planId = objectId.parse(req.params.planId);
    try {
      // Members keep the terms they bought: these are copied onto each membership.
      const plan = await MembershipPlan.findByIdAndUpdate(planId, planSchema.parse(req.body), {
        new: true,
        runValidators: true,
      });
      if (!plan) throw new HttpError(404, "Plan not found");
      res.json(plan);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new HttpError(409, "A plan with this name already exists");
      throw error;
    }
  }

  public async listMemberships(req: Request, res: Response): Promise<void> {
    const { page, limit, status } = membershipListSchema.parse(req.query);
    const now = new Date();

    const filter: Record<string, unknown> = {};
    if (status === "EXPIRED") {
      Object.assign(filter, { status: "ACTIVE", endDate: { $lt: now } });
    } else if (status === "EXPIRING") {
      Object.assign(filter, runningFilter(now), {
        endDate: { $gte: now, $lte: addDays(now, EXPIRY_WARNING_DAYS) },
      });
    } else if (status === "ACTIVE") {
      Object.assign(filter, { status: "ACTIVE", endDate: { $gte: now } });
    } else if (status) {
      filter.status = status;
    }

    const [memberships, total] = await Promise.all([
      Membership.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", NAME_FIELDS),
      Membership.countDocuments(filter),
    ]);

    res.json({
      total,
      page,
      limit,
      items: memberships.map((item) => ({
        ...presentMembership(item, now),
        member: populatedMember(item),
      })),
    });
  }

  public async assignMembership(req: Request, res: Response): Promise<void> {
    const { userId, planId, ...payment } = paymentSchema
      .extend({ userId: objectId, planId: objectId })
      .parse(req.body);
    res.status(201).json(await assignMembership(userId, planId, payment, req.user!.id));
  }

  public async activateMembership(req: Request, res: Response): Promise<void> {
    const membershipId = objectId.parse(req.params.membershipId);
    res.json(await activateMembership(membershipId, paymentSchema.parse(req.body), req.user!.id));
  }

  public async freezeMembership(req: Request, res: Response): Promise<void> {
    res.json(await freezeMembership(objectId.parse(req.params.membershipId)));
  }

  public async unfreezeMembership(req: Request, res: Response): Promise<void> {
    res.json(await unfreezeMembership(objectId.parse(req.params.membershipId)));
  }

  public async cancelMembership(req: Request, res: Response): Promise<void> {
    const { reason } = reasonSchema.parse(req.body);
    res.json(await cancelMembership(objectId.parse(req.params.membershipId), reason));
  }

  public async listPayments(req: Request, res: Response): Promise<void> {
    const { page, limit, status } = paymentListSchema.parse(req.query);
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([
      Payment.find(filter)
        .sort({ paidAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", NAME_FIELDS)
        .lean(),
      Payment.countDocuments(filter),
    ]);
    res.json({ total, page, limit, items });
  }

  public async refundPayment(req: Request, res: Response): Promise<void> {
    const { reason } = reasonSchema.parse(req.body);
    res.json(await refundPayment(objectId.parse(req.params.paymentId), reason));
  }

  public async listAttendance(req: Request, res: Response): Promise<void> {
    const { page, limit, date } = attendanceListSchema.parse(req.query);
    const dayStart = date ? new Date(`${date}T00:00:00`) : startOfDay(new Date());
    if (Number.isNaN(dayStart.getTime())) throw new HttpError(400, "Invalid date");

    const filter = { checkInAt: { $gte: dayStart, $lt: addDays(dayStart, 1) } };
    const [items, total, inside] = await Promise.all([
      Attendance.find(filter)
        .sort({ checkInAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", `${NAME_FIELDS} isCoach`)
        .lean(),
      Attendance.countDocuments(filter),
      Attendance.countDocuments({ ...filter, isOpen: true }),
    ]);
    res.json({ total, page, limit, inside, items });
  }

  public async checkIn(req: Request, res: Response): Promise<void> {
    const { userId } = z.object({ userId: objectId }).parse(req.body);
    res.status(201).json(await checkIn(userId, req.user!.id));
  }

  public async checkOut(req: Request, res: Response): Promise<void> {
    res.json(await checkOut(objectId.parse(req.params.attendanceId)));
  }

  public async listBookings(req: Request, res: Response): Promise<void> {
    const { page, limit, status } = bookingListSchema.parse(req.query);
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([
      Workout.find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "firstName lastName")
        .populate("coachId", "firstName lastName")
        .lean(),
      Workout.countDocuments(filter),
    ]);
    res.json({ total, page, limit, items });
  }

  public async cancelBooking(req: Request, res: Response): Promise<void> {
    const workoutId = objectId.parse(req.params.workoutId);
    res.json(await workoutService.cancelWorkout(workoutId, { id: req.user!.id, isAdmin: true }));
  }

  public async listTestimonials(_req: Request, res: Response): Promise<void> {
    const doc = (await Testimonial.findOne().lean()) as unknown as ITestimonialDoc | null;
    const entries = Object.entries(doc ?? {}).filter(([, value]) => Array.isArray(value));
    const coaches = await User.find({ _id: { $in: entries.map(([coachId]) => coachId) } })
      .select("firstName lastName")
      .lean();

    const items = entries
      .flatMap(([coachId, reviews]) => {
        const coach = coaches.find((item) => String(item._id) === coachId);
        return reviews.map((review) => ({
          ...review,
          coachId,
          coachName: coach ? `${coach.firstName} ${coach.lastName}` : null,
        }));
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    res.json({ total: items.length, items });
  }

  public async deleteTestimonial(req: Request, res: Response): Promise<void> {
    const coachId = objectId.parse(req.params.coachId);
    const workoutId = objectId.parse(req.params.workoutId);
    const result = await Testimonial.updateOne({}, { $pull: { [coachId]: { workoutId } } });
    if (!result.modifiedCount) throw new HttpError(404, "Review not found");
    res.json({ message: "Review removed" });
  }
}

export const adminController = new AdminController();
