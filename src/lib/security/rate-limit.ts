import { createHash } from "node:crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type ConsumeRateLimitInput = {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
};

declare global {
  var __internshipRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

function getRateLimitStore() {
  if (!globalThis.__internshipRateLimitStore) {
    globalThis.__internshipRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalThis.__internshipRateLimitStore;
}

function toStoreKey(bucket: string, key: string) {
  const fingerprint = createHash("sha256").update(key).digest("hex");

  return `${bucket}:${fingerprint}`;
}

function pruneExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function consumeRateLimit(input: ConsumeRateLimitInput) {
  const now = Date.now();
  const store = getRateLimitStore();

  pruneExpiredEntries(store, now);

  const storeKey = toStoreKey(input.bucket, input.key);
  const existingEntry = store.get(storeKey);

  if (!existingEntry || existingEntry.resetAt <= now) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + input.windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(input.limit - 1, 0),
    };
  }

  if (existingEntry.count >= input.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existingEntry.resetAt - now) / 1000),
      ),
      remaining: 0,
    };
  }

  existingEntry.count += 1;
  store.set(storeKey, existingEntry);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(input.limit - existingEntry.count, 0),
  };
}

export function resetRateLimit(bucket: string, key: string) {
  getRateLimitStore().delete(toStoreKey(bucket, key));
}
