import mongoose, { Document, Schema } from "mongoose";

export const MEMBERSHIP_STATUSES = ["PENDING", "ACTIVE", "FROZEN", "CANCELLED"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface IMembership extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  // Plan terms are copied so later plan edits never change what a member bought.
  planName: string;
  price: number;
  durationDays: number;
  sessionLimit: number | null;
  sessionsUsed: number;
  status: MembershipStatus;
  startDate?: Date;
  endDate?: Date;
  frozenAt?: Date;
  frozenDays: number;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    planName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    sessionLimit: { type: Number, default: null },
    sessionsUsed: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: MEMBERSHIP_STATUSES, required: true, default: "PENDING" },
    startDate: Date,
    endDate: Date,
    frozenAt: Date,
    frozenDays: { type: Number, default: 0 },
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true }
);

// A member can only have one request waiting for payment at a time.
membershipSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" }, name: "one_pending_per_user" }
);
membershipSchema.index({ status: 1, endDate: 1 });

export const Membership = mongoose.model<IMembership>("Membership", membershipSchema);
