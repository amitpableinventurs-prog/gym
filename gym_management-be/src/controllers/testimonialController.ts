import { Request, Response } from "express";
import { z } from "zod";
import { Testimonial } from "../models/Testimonial";
import { ITestimonialDoc } from '../models/Testimonial';
import User from "../models/User";
import { Workout } from "../models/workout.model";
import { HttpError } from "../utils/httpError";
import { objectId } from "../utils/validation";

const testimonialSchema = z.object({
  workoutId: objectId,
  rating: z.number().min(0).max(5),
  feedback: z.string().trim().min(3).max(500),
});

class TestimonialController {
  public async createTestimonial(req: Request, res: Response): Promise<void> {
    const { workoutId, rating, feedback } = testimonialSchema.parse(req.body);
    const authorId = req.user!.id;

    const workout = await Workout.findById(workoutId);
    if (!workout) throw new HttpError(404, "Workout not found");

    const isClient = String(workout.userId) === authorId;
    const isCoach = String(workout.coachId) === authorId;
    if (!isClient && !isCoach) {
      throw new HttpError(403, "You can only review your own sessions");
    }
    if (!["WAITING_FOR_FEEDBACK", "FINISHED"].includes(workout.status)) {
      throw new HttpError(409, "This session is not open for feedback");
    }

    // Identity comes from the session, so a review cannot be filed under another name.
    const coachId = String(workout.coachId);
    const doc = await Testimonial.findOne().lean();
    const existing = ((doc as unknown as ITestimonialDoc | null)?.[coachId] ?? []).some(
      (entry) => entry.workoutId === workoutId && !!entry.isCoach === isCoach
    );
    if (existing) throw new HttpError(409, "Feedback was already submitted for this session");

    const author = await User.findById(authorId).select("firstName lastName");
    await Testimonial.updateOne(
      {},
      {
        $push: {
          [coachId]: {
            firstName: author?.firstName,
            lastName: author?.lastName,
            date: new Date().toISOString().split("T")[0],
            rating,
            testimonial: feedback,
            workoutId,
            isCoach,
          },
        },
      },
      { upsert: true }
    );
    res.status(201).json({ message: "Testimonial created successfully" });
  }

  public async getTestimonial(req: Request, res: Response): Promise<void> {
    const coachId = objectId.parse(req.params.coachId);
    const doc = await Testimonial.findOne({}, { [coachId]: 1 }).lean();
    const entries = (doc as unknown as ITestimonialDoc | null)?.[coachId] ?? [];
    res.status(200).json({ [coachId]: entries });
  }
}

export const testimonialController = new TestimonialController();
