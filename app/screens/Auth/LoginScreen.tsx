import React from "react";
import { TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  clearError,
  loginThunk,
  sendOtpThunk,
} from "../../../store/slices/authSlice";
import type { UserRole } from "../../types/roles";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, otpSending } = useAppSelector((s) => s.auth);

  React.useEffect(() => {
    if (error) {
      Alert.alert("Sign in", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSendOtp = async (identifier: string) => {
    await dispatch(sendOtpThunk(identifier));
  };

  const handleLogin = async (
    identifier: string,
    passwordOrOtp: string,
    expectedRole: UserRole
  ) => {
    const result = await dispatch(
      loginThunk({ identifier, passwordOrOtp, expectedRole })
    );
    if (loginThunk.fulfilled.match(result)) {
      router.replace("/home" as any);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }} edges={["top"]}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          style={{ flex: 1, backgroundColor: "#F8FAFC" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={20}
          extraHeight={120}
        >
          <LoginHeader />
          <LoginForm
            onSendOtp={handleSendOtp}
            onLogin={handleLogin}
            loading={loading}
            otpSending={otpSending}
          />
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
