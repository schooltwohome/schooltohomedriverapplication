# PR note: Helper push registration

## Backend

- **Added:** `POST /api/v1/users/me/device` (authenticated school-linked users: driver, helper, staff, admin — **not** using `/parents/device`).
- **Blocked until deploy:** Client registration fails against older servers without this route; use `EXPO_PUBLIC_HELPER_PUSH_API_DISABLED=1` for local UI testing or ship backend first.
- **Delivery (separate from registration):** Device rows are stored, but current send path for bus/parent alerts is `sendExpoPushToParentDevices` in `expoPush.service.ts`. If staff should **receive** those (or other) notifications, the server must be extended to target their user ids (or a dedicated sender) in addition to parent sends.

## Product

- **Open decision:** Whether helpers/drivers should receive the **same** push types as parents (`data.type` parity) vs **helper-only** payloads — server send logic must align; the app currently maps the same `type` strings as the parent app when pushes are delivered.
