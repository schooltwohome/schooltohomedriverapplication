import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeDashboard from "./_components/home/HomeDashboard";
import { Theme } from "./_theme/theme";
import { useAppSelector } from "../store/hooks";

export default function HomeScreen() {
  const token = useAppSelector((s) => s.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/screens/Auth/LoginScreen");
    }
  }, [token, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <HomeDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
});
