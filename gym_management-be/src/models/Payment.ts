import mongoose, { Document, Schema } from "mongoose";

export const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IPayment extends Document {
  invoiceNumber: string;
  userId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  planName: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  status: "PAID" | "REFUNDED";
  paidAt: Date;
  refundedAt?: Date;
  refundReason?: string;
  recordedBy: mongoose.Types.ObjectId;
}

const paymentSchema = new Schema<IPayment>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipId: { type: Schema.Types.ObjectId, ref: "Membership", required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    reference: { type: String, trim: true },
    note: { type: String, trim: true },
    status: { type: String, enum: ["PAID", "REFUNDED"], default: "PAID" },
    paidAt: { type: Date, required: true, default: Date.now, index: true },
    refundedAt: Date,
    refundReason: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
