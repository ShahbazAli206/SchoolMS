import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../../services/authService';

export const loginUser = createAsyncThunk('auth/login', async (credentials, {rejectWithValue}) => {
  try {
    const response = await authAPI.login(credentials);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, {rejectWithValue}) => {
  try {
    await authAPI.logout();
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    return true; // Return success
  } catch (error) {
    // Even if the API call fails, we still want to logout locally
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    return true; // Still return success for local logout
  }
});

export const refreshToken = createAsyncThunk('auth/refresh', async (_, {getState, rejectWithValue}) => {
  try {
    const token = getState().auth.refreshToken;
    const response = await authAPI.refresh(token);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    otpRequired: false,
    sessionExpiresAt: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
    },
    clearError: state => {
      state.error = null;
    },
    setOtpRequired: (state, action) => {
      state.otpRequired = action.payload;
    },
    updateUser: (state, action) => {
      state.user = {...state.user, ...action.payload};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.otpRequired) {
          state.otpRequired = true;
        } else {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.sessionExpiresAt = action.payload.sessionExpiresAt;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.otpRequired = false;
        state.sessionExpiresAt = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const {setCredentials, clearError, setOtpRequired, updateUser} = authSlice.actions;
export default authSlice.reducer;
