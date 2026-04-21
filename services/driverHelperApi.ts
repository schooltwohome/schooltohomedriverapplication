import { apiRequest } from "./http";

export type LoginResponse = {
  token: string;
  user: {
    uuid: string;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    name?: string | null;
  };
};

export type MeAssignment = {
  bus: {
    id: string;
    bus_number: string;
    number_plate: string | null;
  };
  route: {
    id: string;
    route_name: string;
    stops: Array<{
      id: string;
      stop_name: string;
      latitude: string;
      longitude: string;
      stop_order: number;
    }>;
  } | null;
};

export type DriverHelperMe = {
  user: {
    uuid: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    school: { uuid: string; name: string } | null;
  };
  assignment: MeAssignment | null;
};

/** GET /users/me/trip-setup — school buses and routes for driver/helper pickers. */
export type TripSetupResponse = {
  buses: Array<{
    id: string;
    bus_number: string;
    number_plate: string | null;
    capacity: number | null;
    status: "available" | "in_use" | "maintenance";
  }>;
  routes: Array<{
    id: string;
    route_name: string;
    stops_count: number;
    students_count: number;
  }>;
};

export function requestAuthOtp(identifier: string, deliveryMethod: "sms" | "email" = "sms") {
  return apiRequest<{ deliveryMethod?: string }>("/api/v1/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ identifier: identifier.trim(), deliveryMethod }),
  });
}

/** Same `/auth/login` body for both password and OTP (server field is `password`). */
export function loginWithIdentifier(identifier: string, passwordOrOtp: string) {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier: identifier.trim(),
      password: passwordOrOtp,
    }),
  });
}

export function getDriverHelperMe(token: string) {
  return apiRequest<DriverHelperMe>("/api/v1/users/me", {
    method: "GET",
    token,
  });
}

export function getTripSetup(token: string) {
  return apiRequest<TripSetupResponse>("/api/v1/users/me/trip-setup", {
    method: "GET",
    token,
  });
}

/** GET /users/me/route-stops/:routeId — ordered stops with coordinates and per-stop student counts. */
export type RouteStopsLiveResponse = {
  stops: Array<{
    id: string;
    stop_name: string;
    latitude: string;
    longitude: string;
    stop_order: number;
    students_count: number;
  }>;
};

export function getRouteStopsLive(token: string, routeId: string) {
  return apiRequest<RouteStopsLiveResponse>(
    `/api/v1/users/me/route-stops/${encodeURIComponent(routeId)}`,
    {
      method: "GET",
      token,
    }
  );
}

/** GET /users/me/route-roster/:routeId — students on route; optional busId merges active trip attendance. */
export type RouteRosterStudent = {
  id: string;
  name: string;
  grade: string | null;
  stop_name: string;
  status: "present" | "absent" | "pending";
  boarded_at?: string | null;
  dropped_at?: string | null;
  assigned_to_trip?: boolean;
  is_present?: boolean;
};

export function getRouteRoster(token: string, routeId: string, busId?: string) {
  const q = busId ? `?busId=${encodeURIComponent(busId)}` : "";
  return apiRequest<{ students: RouteRosterStudent[] }>(
    `/api/v1/users/me/route-roster/${encodeURIComponent(routeId)}${q}`,
    {
      method: "GET",
      token,
    }
  );
}

/** POST /users/me/attendance/simulate-nfc-tap — backend marks one random absent student present. */
export type SimulateNfcTapResponse = {
  student: {
    id: string;
    uuid: string;
    name: string;
    rosterStatus: "present";
    boarded_at: string;
  };
  attendance: {
    id: string;
    status: string;
    boarded_at: string;
  };
};

export function simulateNfcTap(
  token: string,
  payload: { routeId: number; busId: number }
) {
  return apiRequest<SimulateNfcTapResponse>(
    "/api/v1/users/me/attendance/simulate-nfc-tap",
    {
      method: "POST",
      token,
      body: JSON.stringify({
        routeId: payload.routeId,
        busId: payload.busId,
      }),
    }
  );
}

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function listMyNotifications(token: string, limit = 50) {
  return apiRequest<NotificationRow[]>(
    `/api/v1/users/me/notifications?limit=${limit}`,
    {
      method: "GET",
      token,
    }
  );
}

export function markAllMyNotificationsRead(token: string) {
  return apiRequest<{ success: boolean }>(
    "/api/v1/users/me/notifications/read-all",
    {
      method: "PATCH",
      token,
    }
  );
}

export function markMyNotificationRead(token: string, notificationId: string) {
  return apiRequest<{ success: boolean }>(
    `/api/v1/users/me/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "PATCH",
      token,
    }
  );
}

export function postBusLocation(
  token: string,
  payload: { busId: number; latitude: number; longitude: number; speed?: number }
) {
  return apiRequest<unknown>("/api/v1/bus/location", {
    method: "POST",
    token,
    body: JSON.stringify({
      busId: payload.busId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      ...(payload.speed !== undefined ? { speed: payload.speed } : {}),
    }),
  });
}

/** POST /bus/attendance/nfc-tap — mark student boarded on active trip (roster shows as present). */
export type NfcTapAttendanceResult = {
  student: {
    uuid: string;
    name: string;
    student_code: string | null;
    grade: string | null;
  };
  trip: { id: string; status: string };
  attendance: {
    status: "boarded";
    boarded_at: string;
    already_boarded: boolean;
  };
};

export function postBusAttendanceNfcTap(
  token: string,
  payload: {
    busId: number;
    routeId: number;
    studentUuid?: string;
    uid?: string;
    studentCode?: string;
  }
) {
  return apiRequest<NfcTapAttendanceResult>("/api/v1/bus/attendance/nfc-tap", {
    method: "POST",
    token,
    body: JSON.stringify({
      busId: payload.busId,
      routeId: payload.routeId,
      ...(payload.studentUuid ? { studentUuid: payload.studentUuid } : {}),
      ...(payload.uid ? { uid: payload.uid.trim() } : {}),
      ...(payload.studentCode ? { studentCode: payload.studentCode.trim() } : {}),
    }),
  });
}
