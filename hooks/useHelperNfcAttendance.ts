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
  onMarkedPresent: (payload: { studentUuid: string; boardedAt?: string | null }) => void | Promise<void>;
  onStatus: (msg: { type: "idle" | "listening" | "processing" | "success" | "error"; text?: string }) => void;
};

export function useHelperNfcAttendance({
  enabled,
  token,
  routeIdNum,
  busIdNum,
  mode = "simulate",
  onMarkedPresent,
  onStatus,
}: Params) {
  const paramsRef = useRef({ token, routeIdNum, busIdNum, mode, onMarkedPresent, onStatus });
  paramsRef.current = { token, routeIdNum, busIdNum, mode, onMarkedPresent, onStatus };
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
          text: "Hold the phone near a student RFID card to mark present.",
        });

        NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: { id?: string | number[] }) => {
          const {
            token: t,
            routeIdNum: route,
            busIdNum: bus,
            mode: m,
            onMarkedPresent: mark,
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
            const result =
              m === "simulate"
                ? await simulateNfcTap(t, { routeId: Number(route), busId: Number(bus) })
                : await postBusAttendanceNfcTap(t, { busId: bus, nfcUid: String(uid) });
            if (cancelled) return;
            const studentUuid =
              m === "simulate" ? result.student.id : result.student.uuid;
            const boardedAt =
              m === "simulate" ? result.student.boarded_at : result.attendance.boarded_time;

            await mark({ studentUuid, boardedAt });
            status({
              type: "success",
              text:
                m === "simulate"
                  ? `${result.student.name} marked present.`
                  : result.attendance.already_boarded
                    ? `${result.student.name} was already marked present.`
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
