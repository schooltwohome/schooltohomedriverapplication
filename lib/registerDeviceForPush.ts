import Constants from "expo-constants";
import { registerMyPushDevice } from "../services/driverHelperApi";

/**
 * Registers this device's Expo push token with `POST /api/v1/users/me/device`
 * (school-linked JWT — driver/helper/staff). Do **not** use `/parents/device` here.
 *
 * Set `EXPO_PUBLIC_HELPER_PUSH_API_DISABLED=1` to skip the network call while testing
 * permissions / builds before the API is deployed (see docs/HELPER_PUSH.md).
 */
export async function registerDeviceForPush(
  jwt: string | null,
  expoPushToken: string
): Promise<void> {
  if (!jwt?.trim()) {
    throw new Error("Not signed in");
  }

  const disabled =
    process.env.EXPO_PUBLIC_HELPER_PUSH_API_DISABLED === "true" ||
    process.env.EXPO_PUBLIC_HELPER_PUSH_API_DISABLED === "1";

  if (disabled) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.info(
        "[SchoolToHome] Push registration skipped (EXPO_PUBLIC_HELPER_PUSH_API_DISABLED)"
      );
    }
    return;
  }

  await registerMyPushDevice(jwt, {
    expoPushToken,
    deviceType: "expo",
    appVersion: Constants.expoConfig?.version ?? undefined,
  });
}
