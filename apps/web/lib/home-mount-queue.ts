/** Gap between consecutive homepage heavy mounts (charts, studio). */
const MOUNT_STAGGER_MS = 150;
const IDLE_TIMEOUT_MS = 1500;

/** Top-to-bottom homepage order for simultaneous viewport entries. */
export const HOME_MOUNT_PRIORITIES = {
  "showcase-line": 0,
  "showcase-pie": 1,
  "showcase-ring": 2,
  "showcase-bar": 3,
  "showcase-choropleth": 4,
  "showcase-radar": 5,
  "showcase-gauge": 6,
  "showcase-heatmap": 7,
  studio: 8,
} as const;

export type HomeMountKey = keyof typeof HOME_MOUNT_PRIORITIES;

export function getHomeMountPriority(key: string): number {
  return (
    HOME_MOUNT_PRIORITIES[key as HomeMountKey] ??
    HOME_MOUNT_PRIORITIES["showcase-heatmap"] + 1
  );
}

function scheduleIdleWork(callback: () => void, timeoutMs: number) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(callback, { timeout: timeoutMs });
    return;
  }

  window.setTimeout(callback, 16);
}

interface QueueEntry {
  priority: number;
  cancelled: boolean;
  run: () => void;
}

const pending: QueueEntry[] = [];
let draining = false;

async function drainQueue() {
  if (draining) {
    return;
  }

  draining = true;

  try {
    while (pending.length > 0) {
      pending.sort((a, b) => a.priority - b.priority);
      const entry = pending.shift();
      if (!entry || entry.cancelled) {
        continue;
      }

      await new Promise<void>((resolve) => {
        scheduleIdleWork(() => {
          if (!entry.cancelled) {
            entry.run();
          }
          resolve();
        }, IDLE_TIMEOUT_MS);
      });

      if (pending.length > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, MOUNT_STAGGER_MS);
        });
      }
    }
  } finally {
    draining = false;
    if (pending.length > 0) {
      drainQueue();
    }
  }
}

/**
 * Enqueue a heavy homepage mount. Items that enter the viewport together
 * run one-at-a-time in `HOME_MOUNT_PRIORITIES` order.
 */
export function requestHomeMount(
  priority: number,
  onMount: () => void
): () => void {
  const entry: QueueEntry = {
    priority,
    cancelled: false,
    run: onMount,
  };

  pending.push(entry);
  drainQueue();

  return () => {
    entry.cancelled = true;
  };
}
