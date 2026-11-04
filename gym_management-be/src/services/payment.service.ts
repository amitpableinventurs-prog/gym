import { nextSequence } from "../models/Counter";
import { IMembership } from "../models/Membership";
import { IPayment, Payment, PaymentMethod } from "../models/Payment";
import { HttpError } from "../utils/httpError";

export interface PaymentInput {
  amount?: number; // Defaults to the plan price; lower it to apply a discount
  method: PaymentMethod;
  reference?: string;
  note?: string;
}

const nextInvoiceNumber = async (paidAt: Date): Promise<string> => {
  const year = paidAt.getFullYear();
  const seq = await nextSequence(`invoice-${year}`);
  return `INV-${year}-${String(seq).padStart(6, "0")}`;
};

export const recordMembershipPayment = async (
  membership: IMembership,
  input: PaymentInput,
  recordedBy: string
): Promise<IPayment> => {
  const paidAt = new Date();
  return Payment.create({
    invoiceNumber: await nextInvoiceNumber(paidAt),
    userId: membership.userId,
    membershipId: membership._id,
    planName: membership.planName,
    amount: input.amount ?? membership.price,
    method: input.method,
    reference: input.reference,
    note: input.note,
    paidAt,
    recordedBy,
  });
};

export const refundPayment = async (paymentId: string, reason: string): Promise<IPayment> => {
  const payment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: "PAID" },
    { status: "REFUNDED", refundedAt: new Date(), refundReason: reason },
    { new: true }
  );
  if (!payment) {
    throw new HttpError(409, "Payment not found or already refunded");
  }
  return payment;
};
