import mongoose from 'mongoose';
import User from '../models/User';
import { IWorkout, Workout } from '../models/workout.model';
import { parseWorkoutStart } from '../utils/dates';
import { HttpError, isDuplicateKeyError } from '../utils/httpError';
import { releaseSession, reserveSession } from './membership.service';

interface BookWorkoutRequest {
  userId: string;
  date: string;
  time: string;
  activity: string;
  coachId: string;
}

export interface Actor {
  id: string;
  isAdmin: boolean;
}

const participantRole = (workout: IWorkout, actor: Actor) => {
  if (String(workout.userId) === actor.id) return 'client';
  if (String(workout.coachId) === actor.id) return 'coach';
  return actor.isAdmin ? 'admin' : null;
};

const findForActor = async (workoutId: string, actor: Actor) => {
  const workout = await Workout.findById(workoutId);
  if (!workout) throw new HttpError(404, 'Workout not found');
  const role = participantRole(workout, actor);
  if (!role) throw new HttpError(403, 'You can only manage your own workouts');
  return { workout, role };
};

export class WorkoutService {
  public async bookWorkout({ userId, date, time, activity, coachId }: BookWorkoutRequest) {
    const user = await User.findById(userId);
    if (!user) throw new HttpError(404, 'User not found');

    const coach = mongoose.isValidObjectId(coachId) ? await User.findById(coachId) : null;
    if (!coach || coach.isSuspended) throw new HttpError(404, 'Coach not found');

    if (user.isCoach) throw new HttpError(400, 'Coaches cannot book workouts');
    if (!coach.isCoach) throw new HttpError(400, 'Selected user is not a coach');
    if (!coach.timeSlots.includes(time)) {
      throw new HttpError(400, 'This coach does not offer the selected time');
    }

    const start = parseWorkoutStart(date, time);
    if (!start) throw new HttpError(400, 'Invalid date or time');
    if (start <= new Date()) throw new HttpError(400, 'Choose a time in the future');

    const slotTaken = await Workout.exists({ coachId, date, time, status: 'SCHEDULED' });
    if (slotTaken) throw new HttpError(409, 'Coach is unavailable at the selected time');

    const membership = await reserveSession(userId, start);
    try {
      const workout = await Workout.create({
        userId,
        coachId,
        date,
        time,
        activity,
        status: 'SCHEDULED',
        membershipId: membership._id,
      });
      return { message: 'Workout booked successfully', workout };
    } catch (error) {
      await releaseSession(membership._id);
      if (isDuplicateKeyError(error)) {
        throw new HttpError(409, 'Coach is unavailable at the selected time');
      }
      throw error;
    }
  }

  async getUserWorkouts(userId: string, isCoach: boolean) {
    const workouts = await Workout.find(isCoach ? { coachId: userId } : { userId })
      .populate<{ userId: { firstName: string; lastName: string } | null }>('userId', 'firstName lastName')
      .populate<{ coachId: { _id: unknown; firstName: string; lastName: string } | null }>(
        'coachId',
        'firstName lastName'
      );

    return workouts.map((workout) => ({
      workoutId: workout._id,
      date: workout.date,
      time: workout.time,
      activity: workout.activity,
      status: workout.status,
      userFirstName: workout.userId?.firstName,
      userLastName: workout.userId?.lastName,
      coachFirstName: workout.coachId?.firstName ?? 'Unknown',
      coachLastName: workout.coachId?.lastName ?? 'Unknown',
      coachId: workout.coachId?._id ?? 'Unknown',
    }));
  }

  async updateStatus(workoutId: string, status: string, actor: Actor) {
    if (status === 'CANCELLED') return this.cancelWorkout(workoutId, actor);
    if (status === 'FINISHED') return this.finishWorkout(workoutId, actor);
    throw new HttpError(400, 'Unsupported workout status');
  }

  async cancelWorkout(workoutId: string, actor: Actor) {
    const { workout, role } = await findForActor(workoutId, actor);

    const start = parseWorkoutStart(workout.date, workout.time);
    if (role === 'client' && start && start <= new Date()) {
      throw new HttpError(400, 'A session cannot be cancelled after it has started');
    }

    // The status guard stops a repeated cancel from returning the session twice.
    const cancelled = await Workout.findOneAndUpdate(
      { _id: workoutId, status: 'SCHEDULED' },
      { status: 'CANCELLED' },
      { new: true }
    );
    if (!cancelled) throw new HttpError(409, 'Only a scheduled workout can be cancelled');

    await releaseSession(cancelled.membershipId);
    return cancelled;
  }

  async finishWorkout(workoutId: string, actor: Actor) {
    const { workout } = await findForActor(workoutId, actor);
    if (workout.status === 'FINISHED') return workout;

    const finished = await Workout.findOneAndUpdate(
      { _id: workoutId, status: 'WAITING_FOR_FEEDBACK' },
      { status: 'FINISHED' },
      { new: true }
    );
    if (!finished) throw new HttpError(409, 'This workout is not waiting for feedback');
    return finished;
  }

  async setWorkoutStatusToWaitingForFeedback(workoutId: string, actor: Actor) {
    const { workout } = await findForActor(workoutId, actor);

    const start = parseWorkoutStart(workout.date, workout.time);
    if (start && start > new Date()) {
      throw new HttpError(409, 'This workout has not started yet');
    }

    const updated = await Workout.findOneAndUpdate(
      { _id: workoutId, status: 'SCHEDULED' },
      { status: 'WAITING_FOR_FEEDBACK' },
      { new: true }
    );
    return updated ?? workout;
  }
}

export const workoutService = new WorkoutService();
