import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import workoutRoutes from './routes/workout.routes';
import { testimonialRoutes } from './routes/testimonial.routes';
import adminRoutes from './routes/adminRoutes';
import membershipRoutes from './routes/membership.routes';
import { errorHandler } from './utils/httpError';

const app: Application = express();
app.use(cors());  // This will allow all origins

// Middleware for parsing JSON requests
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use(errorHandler);

export default app;
