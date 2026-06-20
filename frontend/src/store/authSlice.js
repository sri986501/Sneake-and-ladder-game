import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('arena_token') || null;
const storedUser = localStorage.getItem('arena_user') ? JSON.parse(localStorage.getItem('arena_user')) : null;

const initialState = {
  token,
  user: storedUser,
  isAuthenticated: !!token,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('arena_token', action.payload.token);
      localStorage.setItem('arena_user', JSON.stringify(action.payload.user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('arena_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('arena_token');
      localStorage.removeItem('arena_user');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { authStart, authSuccess, authFailure, updateUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
