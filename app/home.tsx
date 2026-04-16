import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "./components/home/HomeHeader";
import BottomTabs from "./components/navigation/BottomTabs";
import HomeDashboard from "./components/home/HomeDashboard";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = React.useState("home");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <HomeHeader greeting="Welcome Back!" userName="Test User" />

      <View style={styles.contentContainer}>
        <HomeDashboard />
      </View>

      <BottomTabs
        activeTab={activeTab}
        onTabPress={(tab) => setActiveTab(tab)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Increased to avoid overlap with bottom navigation
  },
  contentContainer: {
    flex: 1,
  },
});
