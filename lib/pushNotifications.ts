import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

/**
 * Remote push via `expo-notifications` is unreliable in Expo Go (SDK 53+ may throw on Android).
 * Use a dev/client build for real tokens; local notification list still uses GET /users/me/notifications.
 */
export function canLoadExpoNotifications(): boolean {
  return Constants.appOwnership !== "expo";
}

function resolveProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  return (
    extra?.eas?.projectId ??
    (Constants as unknown as { easConfig?: { projectId?: string } }).easConfig
      ?.projectId
  );
}

async function loadNotificationsModule(): Promise<
  typeof import("expo-notifications") | null
> {
  if (!canLoadExpoNotifications()) {
    return null;
  }
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

/** Permission + Expo push token, or null if unavailable (simulator, Expo Go, denied). */
export async function getExpoPushTokenOrNull(): Promise<string | null> {
  if (!canLoadExpoNotifications()) {
    return null;
  }
  if (!Device.isDevice) {
    return null;
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "School updates",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0F172A",
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return null;
  }

  const projectId = resolveProjectId();
  try {
    const tokenRes = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();
    return tokenRes.data ?? null;
  } catch {
    return null;
  }
}

export type ForegroundPushPayload = {
  title: string;
  body: string;
  data: Record<string, unknown>;
};

export function subscribeToForegroundPush(handlers: {
  onListRefresh?: () => void;
  onForeground?: (payload: ForegroundPushPayload) => void;
}): () => void {
  if (!canLoadExpoNotifications()) {
    return () => {};
  }

  let cancelled = false;
  let removeListener: (() => void) | undefined;

  void (async () => {
    const Notifications = await loadNotificationsModule();
    if (!Notifications || cancelled) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const sub = Notifications.addNotificationReceivedListener((event) => {
      if (cancelled) return;
      const c = event.request.content;
      const title = typeof c.title === "string" ? c.title : "";
      const body = typeof c.body === "string" ? c.body : "";
      const dataRaw = c.data as Record<string, unknown> | undefined;
      const data =
        dataRaw && typeof dataRaw === "object" ? dataRaw : {};
      handlers.onListRefresh?.();
      handlers.onForeground?.({ title, body, data });
    });
    if (cancelled) {
      sub.remove();
      return;
    }
    removeListener = () => sub.remove();
  })();

  return () => {
    cancelled = true;
    removeListener?.();
  };
}

export function subscribeToExpoPushTokenRefreshes(
  onNewExpoPushToken: (expoPushToken: string) => void
): () => void {
  if (!canLoadExpoNotifications()) {
    return () => {};
  }

  let cancelled = false;
  let removeListener: (() => void) | undefined;

  void (async () => {
    const Notifications = await loadNotificationsModule();
    if (!Notifications || cancelled) return;

    const sub = Notifications.addPushTokenListener(() => {
      void (async () => {
        const token = await getExpoPushTokenOrNull();
        if (token) onNewExpoPushToken(token);
      })();
    });
    if (cancelled) {
      sub.remove();
      return;
    }
    removeListener = () => sub.remove();
  })();

  return () => {
    cancelled = true;
    removeListener?.();
  };
}

export type PushPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "unavailable";

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (!canLoadExpoNotifications()) return "unavailable";
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return "unavailable";
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export async function requestPushPermissionFromUser(): Promise<boolean> {
  if (!canLoadExpoNotifications()) return false;
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}
