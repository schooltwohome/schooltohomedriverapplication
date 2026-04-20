import { Redirect } from "expo-router";

/** Use the main login flow (OTP + role). */
export default function OTPLoginScreen() {
  return <Redirect href="/screens/Auth/LoginScreen" />;
}
