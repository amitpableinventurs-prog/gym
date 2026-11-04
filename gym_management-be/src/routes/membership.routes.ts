import express from "express";
import { z } from "zod";
import { protect } from "../middleware/authMiddleware";
import { MembershipPlan } from "../models/MembershipPlan";
import { getMemberAttendance } from "../services/attendance.service";
import {
  getMemberPayments,
  getMemberSummary,
  presentMembership,
  requestMembership,
  withdrawRequest,
} from "../services/membership.service";
import { asyncHandler } from "../utils/httpError";
import { objectId } from "../utils/validation";

const router = express.Router();

router.get(
  "/plans",
  asyncHandler(async (_req, res) => {
    res.json(await MembershipPlan.find({ isActive: true }).sort({ price: 1 }).lean());
  })
);

router.use(protect);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await getMemberSummary(req.user!.id));
  })
);

router.get(
  "/me/payments",
  asyncHandler(async (req, res) => {
    res.json(await getMemberPayments(req.user!.id));
  })
);

router.get(
  "/me/attendance",
  asyncHandler(async (req, res) => {
    res.json(await getMemberAttendance(req.user!.id));
  })
);

router.post(
  "/request",
  asyncHandler(async (req, res) => {
    const { planId } = z.object({ planId: objectId }).parse(req.body);
    const membership = await requestMembership(req.user!.id, planId);
    res.status(201).json(presentMembership(membership));
  })
);

router.post(
  "/:membershipId/withdraw",
  asyncHandler(async (req, res) => {
    res.json(await withdrawRequest(req.user!.id, objectId.parse(req.params.membershipId)));
  })
);

export default router;
