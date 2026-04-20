import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  getDriverHelperMe,
  loginWithIdentifier,
  requestAuthOtp,
  type DriverHelperMe,
} from "../../services/driverHelperApi";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "../../lib/authTokenStorage";
import type { UserRole } from "../../app/types/roles";
import { normalizeRole } from "../../app/types/roles";

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { token: null as string | null, me: null as DriverHelperMe | null };
      }
      const me = await getDriverHelperMe(token);
      return { token, me };
    } catch {
      await removeAuthToken();
      return rejectWithValue("Session expired");
    }
  }
);

export const sendOtpThunk = createAsyncThunk(
  "auth/sendOtp",
  async (identifier: string, { rejectWithValue }) => {
    try {
      const trimmed = identifier.trim();
      const deliveryMethod = trimmed.includes("@") ? "email" : "sms";
      await requestAuthOtp(trimmed, deliveryMethod);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not send OTP";
      return rejectWithValue(msg);
    }
  }
);

/** Password or OTP — both use `POST /auth/login` with the same `password` field. */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    payload: {
      identifier: string;
      passwordOrOtp: string;
      expectedRole: UserRole;
    },
    { rejectWithValue }
  ) => {
    try {
      const { token, user } = await loginWithIdentifier(
        payload.identifier,
        payload.passwordOrOtp
      );
      const apiRole = normalizeRole(user.role);
      if (!apiRole) {
        return rejectWithValue(
          "Sign in with a driver or helper account created by your school."
        );
      }
      if (apiRole !== payload.expectedRole) {
        return rejectWithValue(
          `This account is registered as a ${apiRole}. Switch role or use the correct account.`
        );
      }
      await setAuthToken(token);
      const me = await getDriverHelperMe(token);
      return { token, me };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      return rejectWithValue(msg);
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await removeAuthToken();
});

export type AuthState = {
  token: string | null;
  initialized: boolean;
  me: DriverHelperMe | null;
  loading: boolean;
  error: string | null;
  otpSending: boolean;
};

const initialState: AuthState = {
  token: null,
  initialized: false,
  me: null,
  loading: false,
  error: null,
  otpSending: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.me = action.payload.me;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.token = null;
        state.me = null;
      })
      .addCase(sendOtpThunk.pending, (state) => {
        state.otpSending = true;
        state.error = null;
      })
      .addCase(sendOtpThunk.fulfilled, (state) => {
        state.otpSending = false;
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.otpSending = false;
        state.error = (action.payload as string) || "OTP failed";
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.me = action.payload.me;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Sign in failed";
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.me = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
