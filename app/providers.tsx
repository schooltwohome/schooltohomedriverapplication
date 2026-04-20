import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { initializeAuth } from "../store/slices/authSlice";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = store.dispatch;

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
}
