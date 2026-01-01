import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

interface initialState {
  user: any;
  user_details: any;
  token: any;
  web_token: any;
  theme: 'light' | 'dark' | null;
}

const initialState: initialState = {
  user: null,
  user_details: null,
  token: null,
  web_token: null,
  theme: null,
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
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setWebToken: (state, action) => {
      state.web_token = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload; // 'light' | 'dark' | null
    },
    logout: (state) => {
      state.user = null;
      state.user_details = null;
      state.token = null;
      state.web_token = null;
      // state.theme = null; // Optional: Decide if logout clears theme. Usually not.
    },
  },
});

export const { setUser, setToken, setWebToken, setUserDetails, setTheme, logout } = auth.actions;
export default auth.reducer;

export const getUser = (state: RootState) => state.auth.user;
export const getUserDetails = (state: RootState) => state.auth.user_details;
export const getToken = (state: RootState) => state.auth.token;
export const getWebToken = (state: RootState) => state.auth.web_token;
export const getTheme = (state: RootState) => state.auth.theme;
