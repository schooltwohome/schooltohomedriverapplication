import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { BusItem, RouteItem } from "../components/driver-trip/types";
import { buildMockRoster } from "../components/helper/buildMockRoster";
import { AttendanceStatus, HelperStudentRow } from "../components/helper/rosterTypes";
import { useAuth } from "./AuthContext";

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
  setStudentAttendance: (studentId: string, status: AttendanceStatus) => void;
}

const HelperAssignmentContext = createContext<HelperAssignmentContextType | undefined>(undefined);

export function HelperAssignmentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [assignment, setAssignmentState] = useState<HelperAssignment | null>(null);
  const [rosterStudents, setRosterStudents] = useState<HelperStudentRow[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAssignmentState(null);
      setRosterStudents([]);
    }
  }, [isAuthenticated]);

  const setAssignment = useCallback((bus: BusItem, route: RouteItem) => {
    setAssignmentState({ bus, route });
    setRosterStudents(buildMockRoster(route));
  }, []);

  const clearAssignment = useCallback(() => {
    setAssignmentState(null);
    setRosterStudents([]);
  }, []);

  const setStudentAttendance = useCallback((studentId: string, status: AttendanceStatus) => {
    setRosterStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  }, []);

  const value = useMemo(
    () => ({
      assignment,
      setAssignment,
      clearAssignment,
      hasAssignment: assignment !== null,
      rosterStudents,
      setStudentAttendance,
    }),
    [assignment, setAssignment, clearAssignment, rosterStudents, setStudentAttendance]
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
