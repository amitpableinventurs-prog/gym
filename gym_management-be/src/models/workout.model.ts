import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // Example: "Feb 12, 2025"
  time: string; // Example: "10:00 AM"
  activity: string; // Example: "Strength Training"
  coachId: mongoose.Types.ObjectId;
  status: string; // Example: "SCHEDULED"
  membershipId?: mongoose.Types.ObjectId; // Membership the session was charged to
}

const WorkoutSchema = new Schema<IWorkout>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  activity: { type: String, required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true },
  membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
});

// Enforced by the database so two simultaneous requests cannot take the same slot.
const scheduledOnly = { status: 'SCHEDULED' };
WorkoutSchema.index(
  { coachId: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: scheduledOnly, name: 'one_booking_per_coach_slot' }
);
WorkoutSchema.index(
  { userId: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: scheduledOnly, name: 'one_booking_per_client_slot' }
);

export const Workout = mongoose.model<IWorkout>('Workout', WorkoutSchema);
