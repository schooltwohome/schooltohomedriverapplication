import { Stack } from "expo-router";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Providers from "./providers";
import { HelperAssignmentProvider } from "./_context/HelperAssignmentContext";
import PushNotificationRoot from "./PushNotificationRoot";
import "./global.css";

export default function RootLayout() {
  return (
    <Providers>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <HelperAssignmentProvider>
            <View style={{ flex: 1 }}>
              <Stack />
              <PushNotificationRoot />
            </View>
          </HelperAssignmentProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Providers>
  );
}
