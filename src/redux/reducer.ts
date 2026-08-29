import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

interface initialState {
  user: any;
  user_details: any;
  user_meta: any;
  token: any;
  web_token: any;
  theme: 'light' | 'dark' | null;
  prayerNotifications: boolean;
  prePrayerNotifications: boolean;
  prePrayerMinutes: number;
  prayerMethod: number;
}

const initialState: initialState = {
  user: null,
  user_details: null,
  user_meta: null,
  token: null,
  web_token: null,
  theme: null,
  prayerNotifications: false,
  prePrayerNotifications: false,
  prePrayerMinutes: 10, // Default 10 mins
  prayerMethod: 11, // Default 11
};

export const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserDetails: (state, action) => {
      state.user_details = action.payload;
    },
    setUserMeta: (state, action) => {
      state.user_meta = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setWebToken: (state, action) => {
      state.web_token = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload; // 'light' | 'dark' | null
    },
    setPrayerNotifications: (state, action) => {
      state.prayerNotifications = action.payload;
    },
    setPrePrayerNotifications: (state, action) => {
      state.prePrayerNotifications = action.payload;
    },
    setPrePrayerMinutes: (state, action) => {
      state.prePrayerMinutes = action.payload;
    },
    setPrayerMethod: (state, action) => {
      state.prayerMethod = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.user_details = null;
      state.user_meta = null;
      state.token = null;
      state.web_token = null;
      // state.theme = null; // Optional: Decide if logout clears theme. Usually not.
    },
  },
});

export const { 
  setUser, 
  setToken, 
  setWebToken, 
  setUserDetails,
  setUserMeta, 
  setTheme, 
  setPrayerNotifications,
  setPrePrayerNotifications,
  setPrePrayerMinutes,
  setPrayerMethod,
  logout,
} = auth.actions;
export default auth.reducer;

export const getUser = (state: RootState) => state.auth.user;
export const getUserDetails = (state: RootState) => state.auth.user_details;
export const getUserMeta = (state: RootState) => state.auth.user_meta;
export const getToken = (state: RootState) => state.auth.token;
export const getWebToken = (state: RootState) => state.auth.web_token;
export const getTheme = (state: RootState) => state.auth.theme;
export const getPrayerNotifications = (state: RootState) => state.auth.prayerNotifications;
export const getPrePrayerNotifications = (state: RootState) => state.auth.prePrayerNotifications;
export const getPrePrayerMinutes = (state: RootState) => state.auth.prePrayerMinutes;
export const getPrayerMethod = (state: RootState) => state.auth.prayerMethod;
