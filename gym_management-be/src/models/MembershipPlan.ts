import mongoose, { Document, Schema } from "mongoose";

export interface IMembershipPlan extends Document {
  name: string;
  description: string;
  price: number; // Whole currency units
  durationDays: number;
  sessionLimit: number | null; // Coach sessions per term; null means unlimited
  features: string[];
  isActive: boolean;
}

const planSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    sessionLimit: { type: Number, default: null, min: 1 },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MembershipPlan = mongoose.model<IMembershipPlan>("MembershipPlan", planSchema);
