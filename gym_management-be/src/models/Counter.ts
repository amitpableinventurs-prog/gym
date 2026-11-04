import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model<{ _id: string; seq: number }>("Counter", counterSchema);

export const nextSequence = async (name: string): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};
