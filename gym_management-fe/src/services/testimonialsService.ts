import axios from "axios";
import apiClient from "./apiClient";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL + "/testimonials";

interface Testimonial {
  coachId: string;
  firstName: string;
  lastName: string;
  rating: number;
  feedback: string;
  workoutId: string;
  isCoach: boolean;
}

export const getTestimonials = async (coachId: string) => {
  const response = await axios.get(`${BASE_URL}/${coachId}`);
  return response.data;
};

export const addTestimonial = async (testimonialData: Testimonial) => {
  const response = await apiClient.post("/testimonials", testimonialData);
  return response.data;
};
