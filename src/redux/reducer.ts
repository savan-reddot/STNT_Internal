import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

interface initialState {
  user: any;
  user_details: any;
  token: any;
  web_token: any;
}

const initialState: initialState = {
  user: null,
  user_details: null,
  token: null,
  web_token: null,
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
  },
});

export const { setUser, setToken, setWebToken, setUserDetails } = auth.actions;
export default auth.reducer;

export const getUser = (state: RootState) => state.auth.user;
export const getUserDetails = (state: RootState) => state.auth.user_details;
export const getToken = (state: RootState) => state.auth.token;
export const getWebToken = (state: RootState) => state.auth.web_token;
