import { Request, Response } from 'express';
import { z } from 'zod';
import { workoutService } from '../services/workout.service';
import { HttpError } from '../utils/httpError';

const bookingSchema = z.object({
  coachId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  activity: z.string().min(1),
});

const actorOf = (req: Request) => ({
  id: req.user!.id,
  isAdmin: req.user!.isAdmin,
});

export const bookWorkoutController = async (req: Request, res: Response) => {
  // The client is always the signed-in user, never an ID from the request body.
  const booking = bookingSchema.parse(req.body);
  const result = await workoutService.bookWorkout({ ...booking, userId: req.user!.id });
  res.status(201).json(result);
};

export const getUserWorkoutsController = async (req: Request, res: Response) => {
  const { userId, isCoach } = req.params;
  if (req.user!.id !== userId && !req.user!.isAdmin) {
    throw new HttpError(403, 'You can only view your own workouts');
  }
  res.status(200).json(await workoutService.getUserWorkouts(userId, isCoach === 'true'));
};

export const cancelWorkoutController = async (req: Request, res: Response) => {
  const { status } = z.object({ status: z.string() }).parse(req.body);
  res.status(200).json(await workoutService.updateStatus(req.params.workoutId, status, actorOf(req)));
};

export const setWorkoutStatusToWaitingForFeedbackController = async (req: Request, res: Response) => {
  res
    .status(200)
    .json(await workoutService.setWorkoutStatusToWaitingForFeedback(req.params.workoutId, actorOf(req)));
};
