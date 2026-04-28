import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { BusItem, RouteItem } from "../_components/driver-trip/types";
import { AttendanceStatus, HelperStudentRow } from "../_components/helper/rosterTypes";
import { useAppSelector } from "../../store/hooks";
import { assignmentToBusRoute } from "../../lib/mapAssignment";
import { getRouteRoster } from "../../services/driverHelperApi";
import { mapRouteRosterToHelperRows } from "../../lib/mapRouteRoster";

export interface HelperAssignment {
  bus: BusItem;
  route: RouteItem;
}

interface HelperAssignmentContextType {
  assignment: HelperAssignment | null;
  setAssignment: (bus: BusItem, route: RouteItem) => void;
  clearAssignment: () => void;
  hasAssignment: boolean;
  rosterStudents: HelperStudentRow[];
  rosterLoading: boolean;
  rosterError: string | null;
  refetchRoster: () => Promise<void>;
  setStudentAttendance: (
    studentId: string,
    update: { status: AttendanceStatus; boardedAt?: string | null }
  ) => void;
}

const HelperAssignmentContext = createContext<HelperAssignmentContextType | undefined>(undefined);

export function HelperAssignmentProvider({ children }: { children: ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  const me = useAppSelector((s) => s.auth.me);
  const userDismissedApiAssignment = useRef(false);

  const [assignment, setAssignmentState] = useState<HelperAssignment | null>(null);
  const [rosterStudents, setRosterStudents] = useState<HelperStudentRow[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      userDismissedApiAssignment.current = false;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAssignmentState(null);
      setRosterStudents([]);
      setRosterError(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token || userDismissedApiAssignment.current) return;
    const role = me?.user?.role?.toLowerCase();
    if (role !== "helper") return;
    if (!me?.assignment?.route) return;
    const { bus, route } = assignmentToBusRoute(me.assignment);
    setAssignmentState({ bus, route });
  }, [token, me?.assignment, me?.user?.role]);

  const fetchRoster = useCallback(async () => {
    if (!assignment || !token) {
      setRosterStudents([]);
      setRosterLoading(false);
      setRosterError(null);
      return;
    }
    setRosterLoading(true);
    setRosterError(null);
    try {
      const { students } = await getRouteRoster(token, assignment.route.id, assignment.bus.id);
      setRosterStudents(mapRouteRosterToHelperRows(students));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load students";
      setRosterError(msg);
      setRosterStudents([]);
    } finally {
      setRosterLoading(false);
    }
  }, [assignment, token]);

  useEffect(() => {
    (async () => {
      await fetchRoster();
    })();
    return () => {
      // no-op (fetchRoster manages its own state)
    };
  }, [fetchRoster]);

  const setAssignment = useCallback((bus: BusItem, route: RouteItem) => {
    setAssignmentState({ bus, route });
  }, []);

  const clearAssignment = useCallback(() => {
    userDismissedApiAssignment.current = true;
    setAssignmentState(null);
    setRosterStudents([]);
    setRosterError(null);
  }, []);

  const setStudentAttendance = useCallback(
    (studentId: string, update: { status: AttendanceStatus; boardedAt?: string | null }) => {
      setRosterStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status: update.status,
                ...(update.boardedAt !== undefined ? { boardedAt: update.boardedAt } : {}),
              }
            : s
        )
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      assignment,
      setAssignment,
      clearAssignment,
      hasAssignment: assignment !== null,
      rosterStudents,
      rosterLoading,
      rosterError,
      refetchRoster: fetchRoster,
      setStudentAttendance,
    }),
    [
      assignment,
      setAssignment,
      clearAssignment,
      rosterStudents,
      rosterLoading,
      rosterError,
      fetchRoster,
      setStudentAttendance,
    ]
  );

  return (
    <HelperAssignmentContext.Provider value={value}>{children}</HelperAssignmentContext.Provider>
  );
}

export function useHelperAssignment() {
  const ctx = useContext(HelperAssignmentContext);
  if (!ctx) {
    throw new Error("useHelperAssignment must be used within HelperAssignmentProvider");
  }
  return ctx;
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default {};
