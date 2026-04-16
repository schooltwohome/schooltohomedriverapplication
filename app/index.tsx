import { Redirect } from "expo-router";
import "./global.css";

export default function Index() {
  // Redirect immediately to the Login screen
  return <Redirect href="/screens/Auth/LoginScreen" />;
}
