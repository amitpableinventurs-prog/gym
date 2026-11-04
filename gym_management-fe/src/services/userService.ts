import axios from "axios";

export interface RegisterData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  target: string;
  activity: string;
}

const filterData = {
  activity: "Yoga", // Match the activity in the database
  date: "Feb 21, 2025", // Match the date format in the database
  time: "05:00 AM",
  coach: "67b4682375ede51c2583f184" // Ensure this is the correct coach ID
};

const BASE_URL = import.meta.env.VITE_APP_BASE_URL + "/users";

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, data);
    return response;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email,
      password,
    });
    return response;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const updateUser = async (
  data: Partial<RegisterData>,
  token: string,
  userId: string
) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const updatePassword = async (data: object, token: string, userId: string) => {
  try {
    const response = await axios.put(`${BASE_URL}/change-password/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const getCoach = async (token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/coach`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export const filterCoaches = async (filterData: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/filter`, filterData);
    return response.data; // Return the filtered workouts
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error; // Rethrow the error for further handling if needed
  }
};

filterCoaches(filterData)
  .then(workouts => {
    console.log('Filtered Workouts:', workouts);
  })
  .catch(error => {
    console.error('Error:', error);
  });
