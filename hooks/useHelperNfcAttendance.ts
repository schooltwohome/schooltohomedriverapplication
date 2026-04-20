import { useEffect, useRef } from "react";
import NfcManager, { NfcEvents } from "react-native-nfc-manager";

import { nfcUidFromTagEvent } from "../lib/nfcUidFromTag";
import { postBusAttendanceNfcTap } from "../services/driverHelperApi";

type Params = {
  enabled: boolean;
  token: string | null;
  busIdNum: number | null;
  onMarkedPresent: (studentUuid: string) => void;
  onStatus: (msg: { type: "idle" | "listening" | "processing" | "success" | "error"; text?: string }) => void;
};

export function useHelperNfcAttendance({
  enabled,
  token,
  busIdNum,
  onMarkedPresent,
  onStatus,
}: Params) {
  const paramsRef = useRef({ token, busIdNum, onMarkedPresent, onStatus });
  paramsRef.current = { token, busIdNum, onMarkedPresent, onStatus };
  const processingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      onStatus({ type: "idle" });
      return;
    }

    let cancelled = false;

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
          const { token: t, busIdNum: bus, onMarkedPresent: mark, onStatus: status } = paramsRef.current;
          if (!t || bus == null || !Number.isFinite(bus) || bus <= 0) {
            status({ type: "error", text: "Missing bus or session. Check your assignment." });
            return;
          }
          if (processingRef.current) return;

          const uid = nfcUidFromTagEvent(tag);
          if (!uid) {
            status({ type: "error", text: "Could not read the card ID. Try again." });
            return;
          }

          processingRef.current = true;
          status({ type: "processing", text: "Recording attendance…" });

          try {
            const result = await postBusAttendanceNfcTap(t, { busId: bus, nfcUid: uid });
            if (cancelled) return;
            mark(result.student.uuid);
            status({
              type: "success",
              text: result.attendance.already_boarded
                ? `${result.student.name} was already marked present.`
                : `${result.student.name} marked present.`,
            });
          } catch (e) {
            if (cancelled) return;
            const msg = e instanceof Error ? e.message : "Could not record tap.";
            status({ type: "error", text: msg });
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
