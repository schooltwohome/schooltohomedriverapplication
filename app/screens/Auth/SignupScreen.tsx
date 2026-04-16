import React from "react";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import LoginHeader from "./components/LoginHeader";
import SignupForm from "./components/SignupForm";

export default function SignupScreen() {
  const router = useRouter();

  const handleSignup = () => {
    // Signup logic bypassed for UI testing
    console.log("Signup submitted - Navigating to Home");
    router.replace("/home" as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F172A" }} edges={["top"]}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{ 
          headerShown: false,
          animation: "fade"
        }} 
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={{ flex: 1, backgroundColor: "#F8FAFC" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          <LoginHeader />
          <SignupForm onSignup={handleSignup} />
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
