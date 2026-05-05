import { createHash } from "node:crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type ConsumeRateLimitInput = {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitConsumeResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type RateLimitProvider = {
  consume: (key: string, limit: number, windowMs: number) => RateLimitConsumeResult;
  reset: (key: string) => void;
};

declare global {
  var __internshipRateLimitStore: Map<string, RateLimitEntry> | undefined;
  var __internshipRateLimitProvider: RateLimitProvider | undefined;
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

function createMemoryRateLimitProvider(): RateLimitProvider {
  return {
    consume(key, limit, windowMs) {
      const now = Date.now();
      const store = getRateLimitStore();

      pruneExpiredEntries(store, now);

      const existingEntry = store.get(key);

      if (!existingEntry || existingEntry.resetAt <= now) {
        store.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });

        return {
          allowed: true,
          retryAfterSeconds: 0,
          remaining: Math.max(limit - 1, 0),
        };
      }

      if (existingEntry.count >= limit) {
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
      store.set(key, existingEntry);

      return {
        allowed: true,
        retryAfterSeconds: 0,
        remaining: Math.max(limit - existingEntry.count, 0),
      };
    },
    reset(key) {
      getRateLimitStore().delete(key);
    },
  };
}

function getConfiguredProviderName() {
  return process.env.RATE_LIMIT_PROVIDER?.trim().toLowerCase() || "memory";
}

function createConfiguredRateLimitProvider(): RateLimitProvider {
  const providerName = getConfiguredProviderName();

  if (providerName === "memory") {
    return createMemoryRateLimitProvider();
  }

  throw new Error(
    `Unsupported RATE_LIMIT_PROVIDER "${providerName}". Only "memory" is currently implemented.`,
  );
}

function getRateLimitProvider() {
  if (!globalThis.__internshipRateLimitProvider) {
    globalThis.__internshipRateLimitProvider = createConfiguredRateLimitProvider();
  }

  return globalThis.__internshipRateLimitProvider;
}

export function consumeRateLimit(input: ConsumeRateLimitInput) {
  return getRateLimitProvider().consume(
    toStoreKey(input.bucket, input.key),
    input.limit,
    input.windowMs,
  );
}

export function resetRateLimit(bucket: string, key: string) {
  getRateLimitProvider().reset(toStoreKey(bucket, key));
}
