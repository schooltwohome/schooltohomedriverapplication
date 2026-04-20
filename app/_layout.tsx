import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Providers from "./providers";
import { HelperAssignmentProvider } from "./_context/HelperAssignmentContext";
import "./global.css";

export default function RootLayout() {
  return (
    <Providers>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <HelperAssignmentProvider>
            <Stack />
          </HelperAssignmentProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Providers>
  );
}
