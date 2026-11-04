import express, { Request, Response } from "express";
import { adminController as admin } from "../controllers/adminController";
import { protect, requireAdmin } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/httpError";

const router = express.Router();
const handle = (handler: (req: Request, res: Response) => Promise<void>) =>
  asyncHandler(handler.bind(admin));

router.use(protect, requireAdmin);

router.get("/overview", handle(admin.getOverview));

router.get("/members", handle(admin.listMembers));
router.get("/members/:userId", handle(admin.getMember));
router.patch("/members/:userId/suspension", handle(admin.setSuspension));

router.get("/plans", handle(admin.listPlans));
router.post("/plans", handle(admin.createPlan));
router.put("/plans/:planId", handle(admin.updatePlan));

router.get("/memberships", handle(admin.listMemberships));
router.post("/memberships", handle(admin.assignMembership));
router.post("/memberships/:membershipId/activate", handle(admin.activateMembership));
router.post("/memberships/:membershipId/freeze", handle(admin.freezeMembership));
router.post("/memberships/:membershipId/unfreeze", handle(admin.unfreezeMembership));
router.post("/memberships/:membershipId/cancel", handle(admin.cancelMembership));

router.get("/payments", handle(admin.listPayments));
router.post("/payments/:paymentId/refund", handle(admin.refundPayment));

router.get("/attendance", handle(admin.listAttendance));
router.post("/attendance/check-in", handle(admin.checkIn));
router.post("/attendance/:attendanceId/check-out", handle(admin.checkOut));

router.get("/bookings", handle(admin.listBookings));
router.post("/bookings/:workoutId/cancel", handle(admin.cancelBooking));

router.get("/testimonials", handle(admin.listTestimonials));
router.delete("/testimonials/:coachId/:workoutId", handle(admin.deleteTestimonial));

export default router;
