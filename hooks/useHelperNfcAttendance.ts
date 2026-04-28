import { useEffect, useRef } from "react";
import NfcManager, { NfcEvents } from "react-native-nfc-manager";

import { nfcUidFromTagEvent } from "../lib/nfcUidFromTag";
import { postBusAttendanceNfcTap, simulateNfcTap } from "../services/driverHelperApi";

type Params = {
  enabled: boolean;
  token: string | null;
  routeIdNum: number | null;
  busIdNum: number | null;
  mode?: "real" | "simulate";
  /**
   * When `mode="simulate"`, you can supply a concrete student UUID to toggle
   * (useful when you only have 1 student and don’t want any stop-based behavior).
   */
  simulateStudentUuid?: string | null;
  onAttendanceChanged: (payload: {
    studentUuid: string;
    status: "present" | "absent";
    boardedAt?: string | null;
  }) => void | Promise<void>;
  onStatus: (msg: { type: "idle" | "listening" | "processing" | "success" | "error"; text?: string }) => void;
};

function normalizeBoardedAt(isoOrTime?: string | null) {
  if (!isoOrTime) return null;
  const raw = String(isoOrTime).trim();
  if (!raw) return null;

  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString();

  // Some backends return `HH:mm:ss` or `HH:mm`. Convert to today-local ISO.
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return new Date().toISOString();
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  const ss = m[3] ? Number(m[3]) : 0;
  if (![hh, mm, ss].every((n) => Number.isFinite(n))) return new Date().toISOString();

  const now = new Date();
  now.setHours(hh, mm, ss, 0);
  return now.toISOString();
}

export function useHelperNfcAttendance({
  enabled,
  token,
  routeIdNum,
  busIdNum,
  mode = "real",
  simulateStudentUuid = null,
  onAttendanceChanged,
  onStatus,
}: Params) {
  const paramsRef = useRef({
    token,
    routeIdNum,
    busIdNum,
    mode,
    simulateStudentUuid,
    onAttendanceChanged,
    onStatus,
  });
  paramsRef.current = {
    token,
    routeIdNum,
    busIdNum,
    mode,
    simulateStudentUuid,
    onAttendanceChanged,
    onStatus,
  };
  const processingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      onStatus({ type: "idle" });
      return;
    }

    let cancelled = false;
    const prettyError = (e: unknown) => {
      const raw = e instanceof Error ? e.message : "Could not record tap.";
      const msg = raw.toLowerCase();
      if (msg.includes("no active trip")) return "No active trip — start a trip for this bus/route first.";
      if (msg.includes("no absent")) return "No absent students left to mark.";
      if (msg.includes("unauthorized") || msg.includes("forbidden")) return "Unauthorized. Please log in again.";
      return raw;
    };

    const cleanup = async () => {
      try {
        await NfcManager.unregisterTagEvent();
      } catch {
        /* noop */
      }
      try {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {});
      } catch {
        /* noop */
      }
    };

    (async () => {
      try {
        const supported = await NfcManager.isSupported();
        if (cancelled) return;
        if (!supported) {
          paramsRef.current.onStatus({
            type: "error",
            text: "This device does not support RFID (NFC) hardware.",
          });
          return;
        }
        await NfcManager.start();
        if (cancelled) return;

        paramsRef.current.onStatus({
          type: "listening",
          text: "Hold the phone near a student RFID card to toggle Present / Absent.",
        });

        NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: { id?: string | number[] }) => {
          const {
            token: t,
            routeIdNum: route,
            busIdNum: bus,
            mode: m,
            simulateStudentUuid: simStudentUuid,
            onAttendanceChanged: mark,
            onStatus: status,
          } = paramsRef.current;

          if (!t || bus == null || !Number.isFinite(bus) || bus <= 0) {
            status({ type: "error", text: "Missing bus or session. Check your assignment." });
            return;
          }
          if (m === "simulate" && (route == null || !Number.isFinite(route) || route <= 0)) {
            status({ type: "error", text: "Missing route assignment. Check your assignment." });
            return;
          }
          if (processingRef.current) return;

          const uid = nfcUidFromTagEvent(tag);
          if (m === "real" && !uid) {
            status({ type: "error", text: "Could not read the card ID. Try again." });
            return;
          }

          processingRef.current = true;
          status({ type: "processing", text: "Recording attendance…" });

          try {
            const result = await (async () => {
              if (m === "simulate") {
                if (simStudentUuid?.trim()) {
                  return postBusAttendanceNfcTap(t, {
                    busId: bus,
                    routeId: Number(route ?? 0),
                    studentUuid: simStudentUuid.trim(),
                  });
                }
                return simulateNfcTap(t, { routeId: Number(route), busId: Number(bus) });
              }

              return postBusAttendanceNfcTap(t, {
                busId: bus,
                routeId: Number(route ?? 0),
                uid: String(uid ?? ""),
              });
            })();
            if (cancelled) return;
            // Prefer UUID consistently so the roster row updates correctly.
            const studentUuid =
              (result as any)?.student?.uuid ??
              (result as any)?.student?.id ??
              result.student.uuid;
            const boardedAt =
              (result as any)?.attendance?.boarded_at ??
              (result as any)?.student?.boarded_at ??
              null;

            const newStatus =
              (result as any)?.attendance?.status === "absent"
                ? "absent"
                : "present";

            await mark({
              studentUuid,
              status: newStatus,
              boardedAt: newStatus === "present" ? normalizeBoardedAt(boardedAt) : null,
            });
            status({
              type: "success",
              text:
                m === "simulate"
                  ? newStatus === "absent"
                    ? `${result.student.name} marked absent.`
                    : `${result.student.name} marked present.`
                  : newStatus === "absent"
                    ? `${result.student.name} marked absent.`
                    : `${result.student.name} marked present.`,
            });
          } catch (e) {
            if (cancelled) return;
            status({ type: "error", text: prettyError(e) });
            paramsRef.current.onStatus({ type: "listening", text: "Ready — tap another RFID card." });
          } finally {
            processingRef.current = false;
          }
        });

        await NfcManager.registerTagEvent({
          alertMessage: "Tap a student card",
          invalidateAfterFirstRead: false,
        });
      } catch {
        if (cancelled) return;
        paramsRef.current.onStatus({
          type: "error",
          text:
            "RFID reader could not start. Use a development build on a phone with NFC. Expo Go does not include the native modules required for RFID scanning.",
        });
      }
    })();

    return () => {
      cancelled = true;
      processingRef.current = false;
      void cleanup();
    };
  }, [enabled]);
}
