import express from 'express';
import {
  bookWorkoutController,
  getUserWorkoutsController,
  cancelWorkoutController,
  setWorkoutStatusToWaitingForFeedbackController,
} from '../controllers/workout.controller';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/httpError';

const router = express.Router();

router.use(protect);
router.post('/book', asyncHandler(bookWorkoutController));
router.get('/:userId/:isCoach', asyncHandler(getUserWorkoutsController));
router.patch('/:workoutId/status', asyncHandler(cancelWorkoutController));
router.patch('/:workoutId/waiting-for-feedback', asyncHandler(setWorkoutStatusToWaitingForFeedbackController));
export default router;
