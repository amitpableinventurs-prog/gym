import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the user state
export interface UserState {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  target: string;
  activity: string;
  password?: string;
  profileImage?: File;
  userSummary?: string;
  selectedLanguage: string;
  isCoach: boolean;
  isAdmin: boolean;
  title?: string;
  timeSlots: string[]; 
}


const initialState: UserState = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  activity: '',
  target: '',
  password: '',
  isCoach: false,
  isAdmin: false,
  userSummary: '',
  selectedLanguage: '',
  title: '',
  timeSlots: [],
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    updateUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 