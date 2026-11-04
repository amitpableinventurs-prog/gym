// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

// User interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isCoach: boolean;
  isAdmin: boolean;
  target: string;
  userSummary: string;
  activity: string;
  title: string;
  timeSlots: string[];
  isSuspended: boolean;
  suspensionReason?: string;
}

// Mongoose schema
const userSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isCoach: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    target: { type: String, required: true },
    activity: { type: String, required: true },
    userSummary: { type: String, required: false },
    title: { type: String, required: false },
    timeSlots: { type: [String], required: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, required: false },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
