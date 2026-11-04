export const DAY_MS = 24 * 60 * 60 * 1000;

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_MS);

export const startOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const daysBetween = (from: Date, to: Date): number =>
  Math.ceil((to.getTime() - from.getTime()) / DAY_MS);

/**
 * Workouts keep their date and time as display strings ("Nov 4, 2026", "05:00 AM").
 * Returns null when they cannot be read as a moment in time.
 */
export const parseWorkoutStart = (date: string, time: string): Date | null => {
  const start = new Date(`${date} ${time}`);
  return Number.isNaN(start.getTime()) ? null : start;
};
