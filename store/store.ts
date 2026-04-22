import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import pushReducer from "./slices/pushSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    push: pushReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
