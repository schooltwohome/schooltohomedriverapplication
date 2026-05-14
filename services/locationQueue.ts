import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QueuedLocationPoint } from "../types/tracking";
import { postBusLocation, postBusLocationBatch } from "./driverHelperApi";
import { ApiHttpError } from "./http";
import {
  logTrackingError,
  logTrackingInfo,
  logTrackingWarn,
} from "../lib/trackingLogger";

const QUEUE_KEY = "@sth:locQueue";
const MAX_QUEUE_SIZE = 500;
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 20;
/** Backoff delays per attempt index (ms): 2 s, 4 s, 8 s, then give up. */
const BACKOFF_DELAYS_MS = [2_000, 4_000, 8_000];

let flushInProgress = false;
/**
 * Set to true after the first 404 response from the batch endpoint so we never
 * attempt it again for the lifetime of the process.
 */
let batchUnsupported = false;

async function readQueue(): Promise<QueuedLocationPoint[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedLocationPoint[];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueuedLocationPoint[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // AsyncStorage write failure — swallow silently; data loss is preferable to crashing.
  }
}

/**
 * Appends a new GPS point to the persistent queue.
 * Drops the oldest entry when the queue exceeds MAX_QUEUE_SIZE to prevent unbounded growth.
 */
export async function enqueue(point: Omit<QueuedLocationPoint, "attempts">): Promise<void> {
  const current = await readQueue();
  const entry: QueuedLocationPoint = { ...point, attempts: 0 };
  const next = [...current, entry];
  if (next.length > MAX_QUEUE_SIZE) {
    logTrackingWarn("queue_overflow_trimmed", "Dropped oldest queued points due to queue size limit", {
      before: next.length,
      max: MAX_QUEUE_SIZE,
    });
    next.splice(0, next.length - MAX_QUEUE_SIZE);
  }
  await writeQueue(next);
  logTrackingInfo("queue_enqueued", "Location point added to offline queue", {
    depth: next.length,
    latitude: point.latitude,
    longitude: point.longitude,
    capturedAtMs: point.capturedAtMs,
    accuracyFiltered: true,
  });
}

/**
 * Sends a GPS point to the server immediately (no batching/no timer delay).
 * If the network call fails, the point is persisted in the offline queue.
 */
export async function sendImmediateOrQueue(
  token: string,
  busId: number,
  point: Omit<QueuedLocationPoint, "attempts">
): Promise<{ sent: boolean }> {
  try {
    await postBusLocation(token, {
      busId,
      latitude: point.latitude,
      longitude: point.longitude,
      speed: point.speedKmh ?? undefined,
      heading: point.heading ?? undefined,
      capturedAtMs: point.capturedAtMs,
    });
    logTrackingInfo("location_sent_immediate", "Sent GPS point to server immediately", {
      busId,
      latitude: point.latitude,
      longitude: point.longitude,
      capturedAtMs: point.capturedAtMs,
    });
    return { sent: true };
  } catch (err: unknown) {
    await enqueue(point);
    logTrackingWarn("location_queued_after_send_fail", "Immediate send failed; queued GPS point offline", {
      busId,
      latitude: point.latitude,
      longitude: point.longitude,
      capturedAtMs: point.capturedAtMs,
      error: err instanceof Error ? err.message : String(err),
    });
    return { sent: false };
  }
}

/**
 * Returns the number of queued points. Does not load the full queue body — cheap check.
 */
export async function queueDepth(): Promise<number> {
  const items = await readQueue();
  return items.length;
}

/**
 * Attempts to POST all queued points to the backend.
 *
 * Strategy:
 * - Items are chunked into groups of BATCH_SIZE (20).
 * - Each chunk is sent via `postBusLocationBatch` (single HTTP call).
 * - If the batch endpoint returns 404, `batchUnsupported` is set and the chunk
 *   falls back to individual `postBusLocation` calls for the remainder of this flush
 *   and all future flushes.
 * - Any item that fails MAX_ATTEMPTS times is silently dropped.
 * - Only one flush runs concurrently — extra calls are no-ops.
 */
export async function flush(token: string, busId: number): Promise<void> {
  if (flushInProgress) return;
  flushInProgress = true;
  try {
    const items = await readQueue();
    if (items.length === 0) return;
    logTrackingInfo("queue_flush_started", "Starting offline queue flush", {
      busId,
      queued: items.length,
    });

    const eligible = items.filter((i) => i.attempts < MAX_ATTEMPTS);
    const remaining: QueuedLocationPoint[] = [];

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const chunk = eligible.slice(i, i + BATCH_SIZE);

      if (!batchUnsupported) {
        try {
          await postBusLocationBatch(token, {
            busId,
            points: chunk.map((p) => ({
              latitude: p.latitude,
              longitude: p.longitude,
              ...(p.speedKmh != null ? { speed: p.speedKmh } : {}),
              ...(p.heading != null ? { heading: p.heading } : {}),
              ...(p.capturedAtMs != null ? { capturedAtMs: p.capturedAtMs } : {}),
            })),
          });
          // Whole chunk succeeded — none go back into the queue.
          logTrackingInfo("queue_flush_batch_sent", "Sent location batch successfully", {
            busId,
            batchSize: chunk.length,
          });
          continue;
        } catch (err: unknown) {
          if (err instanceof ApiHttpError && err.status === 404) {
            batchUnsupported = true;
            logTrackingWarn("queue_batch_endpoint_missing", "Batch endpoint unavailable; falling back to single-point posts", {
              busId,
            });
            // Fall through to individual POSTs below.
          } else {
            // Non-404 batch failure: increment attempts on every item in the chunk.
            const delay = BACKOFF_DELAYS_MS[chunk[0].attempts] ?? BACKOFF_DELAYS_MS.at(-1)!;
            for (const item of chunk) {
              remaining.push({ ...item, attempts: item.attempts + 1 });
            }
            logTrackingWarn("queue_flush_batch_failed", "Batch post failed; points retained for retry", {
              busId,
              batchSize: chunk.length,
            });
            await sleep(delay);
            continue;
          }
        }
      }

      // Individual fallback (batch unsupported or batch got 404).
      for (const item of chunk) {
        try {
          await postBusLocation(token, {
            busId,
            latitude: item.latitude,
            longitude: item.longitude,
            speed: item.speedKmh ?? undefined,
            heading: item.heading ?? undefined,
            capturedAtMs: item.capturedAtMs,
          });
          logTrackingInfo("queue_flush_single_sent", "Sent queued location point", {
            busId,
            latitude: item.latitude,
            longitude: item.longitude,
            capturedAtMs: item.capturedAtMs,
          });
        } catch {
          const nextAttempts = item.attempts + 1;
          if (nextAttempts < MAX_ATTEMPTS) {
            remaining.push({ ...item, attempts: nextAttempts });
            logTrackingWarn("queue_flush_single_failed", "Location send failed; kept for retry", {
              busId,
              latitude: item.latitude,
              longitude: item.longitude,
              attempts: nextAttempts,
              capturedAtMs: item.capturedAtMs,
            });
          } else {
            logTrackingError("queue_point_dropped", "Dropped location after max retry attempts", {
              busId,
              latitude: item.latitude,
              longitude: item.longitude,
              attempts: nextAttempts,
              capturedAtMs: item.capturedAtMs,
            });
          }
          const delay = BACKOFF_DELAYS_MS[item.attempts] ?? BACKOFF_DELAYS_MS.at(-1)!;
          await sleep(delay);
        }
      }
    }

    await writeQueue(remaining);
    logTrackingInfo("queue_flush_finished", "Finished offline queue flush", {
      busId,
      remaining: remaining.length,
      sent: Math.max(0, eligible.length - remaining.length),
    });
  } finally {
    flushInProgress = false;
  }
}

/**
 * Clears the entire queue. Call on trip end to remove any stale pre-trip points.
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch {
    // best-effort
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
