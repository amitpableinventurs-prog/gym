import { Attendance } from "../models/Attendance";
import User from "../models/User";
import { startOfDay } from "../utils/dates";
import { HttpError, isDuplicateKeyError } from "../utils/httpError";
import { getCurrentMembership } from "./membership.service";

export const checkIn = async (userId: string, recordedBy: string) => {
  const user = await User.findById(userId).select("isCoach isAdmin isSuspended");
  if (!user) throw new HttpError(404, "Member not found");
  if (user.isSuspended) {
    throw new HttpError(403, "This account is suspended", "ACCOUNT_SUSPENDED");
  }

  if (!user.isCoach && !user.isAdmin) {
    const membership = await getCurrentMembership(userId);
    if (!membership) {
      throw new HttpError(403, "This member has no active membership", "MEMBERSHIP_REQUIRED");
    }
    if (membership.status === "FROZEN") {
      throw new HttpError(403, "This member's membership is frozen", "MEMBERSHIP_FROZEN");
    }
  }

  // A visit left open on an earlier day means the member forgot to check out.
  const now = new Date();
  await Attendance.updateMany(
    { userId, isOpen: true, checkInAt: { $lt: startOfDay(now) } },
    { isOpen: false, autoClosed: true }
  );

  try {
    return await Attendance.create({ userId, checkInAt: now, recordedBy });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(409, "This member is already checked in");
    }
    throw error;
  }
};

export const checkOut = async (attendanceId: string) => {
  const visit = await Attendance.findOneAndUpdate(
    { _id: attendanceId, isOpen: true },
    { isOpen: false, checkOutAt: new Date() },
    { new: true }
  );
  if (!visit) throw new HttpError(409, "This visit is already checked out");
  return visit;
};

export const getMemberAttendance = async (userId: string) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [visits, visitsThisMonth, totalVisits] = await Promise.all([
    Attendance.find({ userId }).sort({ checkInAt: -1 }).limit(30).lean(),
    Attendance.countDocuments({ userId, checkInAt: { $gte: monthStart } }),
    Attendance.countDocuments({ userId }),
  ]);
  return { visits, visitsThisMonth, totalVisits };
};
