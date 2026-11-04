import { Router } from 'express';
import { testimonialController } from '../controllers/testimonialController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/httpError';

const router = Router();
router.post('/', protect, asyncHandler(testimonialController.createTestimonial));
router.get('/:coachId', asyncHandler(testimonialController.getTestimonial));

export const testimonialRoutes = router;
