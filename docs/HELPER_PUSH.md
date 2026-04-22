# Push notifications (Driver / Helper app)

## Product scope (confirm with product owner)

- The **parent** app registers with `POST /api/v1/parents/device` and receives parent-oriented trip/push content.
- This app uses **`POST /api/v1/users/me/device`** with a **school-scoped** driver/helper (or staff) JWT and the same `devices` table / Expo token format as parents.
- **You should confirm** whether helpers and drivers should receive the **same** parent-style `data.type` payloads (e.g. `bus_approaching`, `driver_trip_start`) for product reasons, or only **staff-specific** notifications. The client maps the same `type` strings as the parent app for deep-link behaviour; the **server** must opt in to actually send those pushes to non-parent device tokens.

## Client behaviour

| Area | Implementation |
|------|----------------|
| Permissions & token | `lib/pushNotifications.ts` — Expo channel on Android, `requestPermissionsAsync`, `getExpoPushTokenAsync` |
| Registration | `lib/registerDeviceForPush.ts` calls `POST /api/v1/users/me/device` with Bearer token (never `/parents/device`) |
| Login + token rotation | `app/PushNotificationRoot.tsx` registers after sign-in and on `addPushTokenListener` |
| 401 on register | `pushSlice` clears `pushRegistered` (same pattern as parent) |
| Foreground | Toast + inbox refresh (`triggerInboxRefresh` → `HomeHeader` refetches notifications) |
| Tap / cold start | `data` → `lib/pushNavigation.ts`: trip-related types → **Home** tab; unknown → notifications sheet |

## Expo Go vs dev / production builds

Remote push tokens are **not** reliable in **Expo Go** (especially Android SDK 53+). Use a **development build** (`expo run:android` / `run:ios`) or an **EAS** build on a **physical device**. In-app inbox still works via `GET /api/v1/users/me/notifications`.

## Testing without hitting the API

Set **`EXPO_PUBLIC_HELPER_PUSH_API_DISABLED=1`** when running Expo: permissions and token acquisition still run locally (where supported), but `registerDeviceForPush` skips the HTTP POST (useful until the deployed API includes `/users/me/device`).

## Backend

This repo adds **`POST /api/v1/users/me/device`** for roles `school_admin`, `admin`, `staff`, `driver`, `helper` (parents continue to use `/parents/device`). Deploy that route before expecting registration to succeed with `EXPO_PUBLIC_HELPER_PUSH_API_DISABLED` unset.
