export type BusStatus = 'Available' | 'In Use' | 'Maintenance';

export interface BusItem {
  id: string;
  name: string;
  licensePlate: string;
  seats: number;
  status: BusStatus;
}

export interface RouteItem {
  id: string;
  name: string;
  stopsCount: number;
  duration: string;
  studentsCount: number;
  /** Another driver has an active trip on this route (driver trip-setup only). */
  lockedByOtherDriverTrip?: boolean;
}

export interface ScheduleItem {
  date: string;
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
}

export interface TripCoords {
  latitude: number;
  longitude: number;
}

/** Captured when the driver taps Start Trip (GPS + clock). */
export interface TripStartSnapshot {
  startedAtMs: number;
  driverLocation: TripCoords | null;
}

export interface TripData {
  bus: BusItem | null;
  route: RouteItem | null;
  schedule: ScheduleItem | null;
  tripStart?: TripStartSnapshot;
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default {};
