import { Alert, Linking, Platform } from "react-native";
import * as Location from "expo-location";
import Constants from "expo-constants";

/**
 * Best-effort education prompt for Android battery optimization.
 * Expo cannot silently whitelist the app; users must grant exemption in Settings.
 */
export async function promptBatteryOptimizationExemption(): Promise<void> {
  if (Platform.OS !== "android" || !Constants.isDevice) return;
  Alert.alert(
    "Keep tracking active",
    "To prevent Android battery optimization from pausing GPS when the screen is off, allow this app to run unrestricted in battery settings.",
    [
      { text: "Later", style: "cancel" },
      {
        text: "Open settings",
        onPress: () => {
          // Most OEMs expose battery optimization controls inside app details.
          void Linking.openSettings().catch(() => {});
        },
      },
    ]
  );
}

export type DriverLocationPermissionState = {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
  locationServicesEnabled: boolean;
};

export async function getDriverLocationPermissionState(): Promise<DriverLocationPermissionState> {
  const [fg, bg, provider] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.getBackgroundPermissionsAsync(),
    Location.getProviderStatusAsync(),
  ]);
  return {
    foregroundGranted: fg.status === "granted",
    backgroundGranted: bg.status === "granted",
    locationServicesEnabled: provider.locationServicesEnabled,
  };
}

