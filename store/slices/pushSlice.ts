import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerDeviceForPush } from "../../lib/registerDeviceForPush";
import { ApiHttpError } from "../../services/http";
import { logoutThunk } from "./authSlice";

type AuthPick = { auth: { token: string | null } };

export type PendingPushIntent =
  | { kind: "tab"; tab: "home" | "attendance" | "profile" }
  | { kind: "notifications" };

type PushState = {
  pushRegistered: boolean;
  pendingPushIntent: PendingPushIntent | null;
  /** Increments when a foreground push arrives so inbox hooks can refetch. */
  inboxRefreshNonce: number;
};

const initialState: PushState = {
  pushRegistered: false,
  pendingPushIntent: null,
  inboxRefreshNonce: 0,
};

export const registerPushDeviceThunk = createAsyncThunk(
  "push/registerDevice",
  async (expoPushToken: string, { getState, rejectWithValue }) => {
    const token = (getState() as AuthPick).auth.token;
    if (!token) return rejectWithValue({ kind: "no_auth" as const });
    try {
      await registerDeviceForPush(token, expoPushToken);
      return true;
    } catch (e: unknown) {
      if (e instanceof ApiHttpError && e.status === 401) {
        return rejectWithValue({ kind: "unauthorized" as const });
      }
      const msg = e instanceof Error ? e.message : "Device registration failed";
      return rejectWithValue({ kind: "error" as const, message: msg });
    }
  }
);

const pushSlice = createSlice({
  name: "push",
  initialState,
  reducers: {
    clearPushRegistration(state) {
      state.pushRegistered = false;
    },
    setPendingPushIntent(state, action: { payload: PendingPushIntent | null }) {
      state.pendingPushIntent = action.payload;
    },
    consumePendingPushIntent(state) {
      state.pendingPushIntent = null;
    },
    triggerInboxRefresh(state) {
      state.inboxRefreshNonce += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerPushDeviceThunk.fulfilled, (state) => {
        state.pushRegistered = true;
      })
      .addCase(registerPushDeviceThunk.rejected, (state, action) => {
        const p = action.payload as { kind?: string } | undefined;
        if (p?.kind === "unauthorized") {
          state.pushRegistered = false;
        }
      })
      .addCase(logoutThunk.fulfilled, () => ({ ...initialState }));
  },
});

export const {
  clearPushRegistration,
  setPendingPushIntent,
  consumePendingPushIntent,
  triggerInboxRefresh,
} = pushSlice.actions;

export default pushSlice.reducer;
