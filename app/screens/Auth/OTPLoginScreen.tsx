import React from "react";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import LoginHeader from "./components/LoginHeader";
import OTPLoginForm from "./components/OTPLoginForm";

/**
 * OTPLoginScreen
 * 
 * - Handles OTP-based authentication flow.
 * - Reuses LoginHeader for UI consistency.
 */
export default function OTPLoginScreen() {
  const router = useRouter();

  const handleOTPLogin = (email: string, otp: string) => {
    // OTP Authentication logic can be added here
    console.log("OTP Login submitted", { email, otp });
    // router.replace("/home");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }} edges={["top"]}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{ 
          headerShown: false,
          animation: "fade" // Smooth symmetric transition

        }} 
      />

      {/* Dismiss keyboard when tapping outside inputs */}
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
          <OTPLoginForm onLogin={handleOTPLogin} />
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
