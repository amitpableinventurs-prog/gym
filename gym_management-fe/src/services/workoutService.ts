import apiClient from "./apiClient";

export const bookWorkout = async (coachId: string, date: string, time: string, activity: string) => {
  const response = await apiClient.post("/workouts/book", { coachId, date, time, activity });
  return response.data;
};

export const getBookedWorkoutsByUsers = async (userId: string, isCoach: boolean) => {
  const response = await apiClient.get(`/workouts/${userId}/${isCoach}`);
  return response.data;
};

export const updateStatus = async (workoutId: string, status: string) => {
  const response = await apiClient.patch(`/workouts/${workoutId}/status`, { status });
  return response.data;
};

export const waitingForFeedback = async (workoutId: string) => {
  const response = await apiClient.patch(`/workouts/${workoutId}/waiting-for-feedback`);
  return response.data;
};
