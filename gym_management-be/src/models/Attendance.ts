import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  checkInAt: Date;
  checkOutAt?: Date;
  isOpen: boolean; // Still inside the gym
  autoClosed: boolean; // Member never checked out; closed by their next visit
  recordedBy: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkInAt: { type: Date, required: true, default: Date.now },
    checkOutAt: Date,
    isOpen: { type: Boolean, default: true },
    autoClosed: { type: Boolean, default: false },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, checkInAt: -1 });
attendanceSchema.index({ checkInAt: -1 });
attendanceSchema.index(
  { userId: 1, isOpen: 1 },
  { unique: true, partialFilterExpression: { isOpen: true }, name: "one_open_visit_per_user" }
);

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);
