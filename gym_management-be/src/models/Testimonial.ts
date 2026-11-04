import mongoose, { Schema, Document } from 'mongoose';

interface ITestimonialEntry {
  firstName: string;
  lastName: string;
  date: string;
  rating: number;
  testimonial: string;
  workoutId: string;
  isCoach: boolean;
}

export interface ITestimonialDoc {
  [coachId: string]: ITestimonialEntry[];
}

export interface ITestimonial extends Document {
  toObject(): { [key: string]: any };
}

const TestimonialSchema = new Schema({}, { 
  strict: false,
  timestamps: false,
  versionKey: false,
  _id: false
}); 

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

