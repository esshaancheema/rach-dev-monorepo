import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api/authAPI';
import { User, AuthTokens, LoginCredentials, RegisterData } from '../../types/auth';
import { storageService } from '../../services/storage';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  error: string | null;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  hasCompletedOnboarding: false,
  error: null,
  biometricEnabled: false,
  twoFactorEnabled: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens securely
      await storageService.setSecureItem('accessToken', response.tokens.accessToken);
      await storageService.setSecureItem('refreshToken', response.tokens.refreshToken);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store tokens securely
      await storageService.setSecureItem('accessToken', response.tokens.accessToken);
      await storageService.setSecureItem('refreshToken', response.tokens.refreshToken);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.tokens?.refreshToken;
      
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
      
      // Clear stored tokens
      await storageService.removeSecureItem('accessToken');
      await storageService.removeSecureItem('refreshToken');
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.tokens?.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authAPI.refreshToken(refreshToken);
      
      // Store new tokens securely
      await storageService.setSecureItem('accessToken', response.tokens.accessToken);
      await storageService.setSecureItem('refreshToken', response.tokens.refreshToken);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await storageService.getSecureItem('accessToken');
      const refreshToken = await storageService.getSecureItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        return null;
      }
      
      // Validate tokens and get user info
      const userInfo = await authAPI.getProfile();
      
      return {
        user: userInfo,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600, // Will be refreshed automatically
        },
      };
    } catch (error: any) {
      // Clear invalid tokens
      await storageService.removeSecureItem('accessToken');
      await storageService.removeSecureItem('refreshToken');
      return rejectWithValue(error.message || 'Failed to load stored auth');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User>, { rejectWithValue }) => {
    try {
      const updatedUser = await authAPI.updateProfile(updates);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      await authAPI.requestPasswordReset(email);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    { token, newPassword }: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      await authAPI.resetPassword(token, newPassword);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const enableTwoFactor = createAsyncThunk(
  'auth/enableTwoFactor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.enableTwoFactor();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Two-factor setup failed');
    }
  }
);

export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (code: string, { rejectWithValue }) => {
    try {
      await authAPI.verifyTwoFactorSetup(code);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Two-factor verification failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOnboardingCompleted: (state) => {
      state.hasCompletedOnboarding = true;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    setTwoFactorEnabled: (state, action: PayloadAction<boolean>) => {
      state.twoFactorEnabled = action.payload;
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.twoFactorEnabled = action.payload.user.twoFactorEnabled || false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        // Still clear auth state even if logout request failed
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = null;
      });

    // Refresh tokens
    builder
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.tokens = action.payload.tokens;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(refreshTokens.rejected, (state) => {
        // Token refresh failed, logout user
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = null;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.twoFactorEnabled = action.payload.user.twoFactorEnabled || false;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
      });

    // Update profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });

    // Two-factor authentication
    builder
      .addCase(verifyTwoFactor.fulfilled, (state) => {
        state.twoFactorEnabled = true;
        if (state.user) {
          state.user.twoFactorEnabled = true;
        }
      });
  },
});

export const {
  clearError,
  setOnboardingCompleted,
  setBiometricEnabled,
  setTwoFactorEnabled,
  updateUserAvatar,
} = authSlice.actions;

export default authSlice.reducer;