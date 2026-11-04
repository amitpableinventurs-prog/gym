import { Request, Response, NextFunction } from 'express';

export const validateWorkoutRequest = (req: Request, res: Response, next: NextFunction) => {
  const { userId, date, time, activity } = req.body;   
  if (!userId || !date || !time || !activity) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  next();
};
