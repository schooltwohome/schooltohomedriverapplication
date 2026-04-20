import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAppSelector } from "../store/hooks";
import "./global.css";

export default function Index() {
  const { token, initialized } = useAppSelector((s) => s.auth);

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/screens/Auth/LoginScreen" />;
}
