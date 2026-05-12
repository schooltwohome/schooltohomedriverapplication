import { useCallback, useEffect, useState } from "react";
import { queueDepth, flush } from "../../services/locationQueue";

const POLL_INTERVAL_MS = 5_000;

/**
 * React hook wrapper around the persistent location queue service.
 * Polls queue depth every 5 s so the caller can display a connectivity indicator
 * without coupling the reporter hook to UI concerns.
 */
export function useOfflineLocationQueue(token: string | null, busId: number | null) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isFlushPending, setIsFlushPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const depth = await queueDepth();
      if (!cancelled) setPendingCount(depth);
    };

    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const manualFlush = useCallback(async () => {
    if (!token || busId === null || isFlushPending) return;
    setIsFlushPending(true);
    try {
      await flush(token, busId);
      const depth = await queueDepth();
      setPendingCount(depth);
    } finally {
      setIsFlushPending(false);
    }
  }, [token, busId, isFlushPending]);

  return { pendingCount, isFlushPending, manualFlush };
}

export default useOfflineLocationQueue;
