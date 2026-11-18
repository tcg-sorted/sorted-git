import { ForgeError } from './types';

export interface AvatarCacheEntry {
  url: string | null;
  at: number;
}

export interface AvatarStore {
  load(): Record<string, AvatarCacheEntry>;
  save(entries: Record<string, AvatarCacheEntry>): void;
}

export interface AvatarResolverOptions<C> {
  lookup: (email: string, sha: string, context: C) => Promise<string | null>;
  store?: AvatarStore;
  now?: () => number;
  concurrency?: number;
  hitTtlMs?: number;
  missTtlMs?: number;
  maxShasPerEmail?: number;
  rateLimitCooldownMs?: number;
  failureCooldownMs?: number;
  maxEntries?: number;
}

export const AVATAR_HIT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const AVATAR_MISS_TTL_MS = 24 * 60 * 60 * 1000;
export const AVATAR_CONCURRENCY = 4;
export const AVATAR_MAX_SHAS_PER_EMAIL = 3;
export const AVATAR_RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000;
export const AVATAR_FAILURE_COOLDOWN_MS = 5 * 60 * 1000;
export const AVATAR_MAX_ENTRIES = 5000;

export function normalizeAvatarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sizedAvatarUrl(url: string, size: number): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'avatars.githubusercontent.com' && !parsed.hostname.endsWith('.githubusercontent.com')) {
      return url;
    }
    parsed.searchParams.set('s', String(Math.max(1, Math.ceil(size))));
    return parsed.toString();
  } catch {
    return url;
  }
}

function safeAvatarUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function isRateLimited(error: unknown): boolean {
  if (!(error instanceof ForgeError)) return false;
  if (error.status === 429) return true;
  return error.status === 403 && /rate limit|secondary/i.test(error.message);
}

function isMissingCommit(error: unknown): boolean {
  return error instanceof ForgeError && (error.status === 404 || error.status === 422);
}

export interface AvatarResolver<C = undefined> {
  cached(email: string): string | null | undefined;
  resolve(email: string, sha: string, context: C): Promise<string | null>;
  clear(): void;
}

export function createAvatarResolver<C = undefined>(options: AvatarResolverOptions<C>): AvatarResolver<C> {
  const now = options.now ?? Date.now;
  const concurrency = options.concurrency ?? AVATAR_CONCURRENCY;
  const hitTtl = options.hitTtlMs ?? AVATAR_HIT_TTL_MS;
  const missTtl = options.missTtlMs ?? AVATAR_MISS_TTL_MS;
  const maxShas = options.maxShasPerEmail ?? AVATAR_MAX_SHAS_PER_EMAIL;
  const rateLimitCooldown = options.rateLimitCooldownMs ?? AVATAR_RATE_LIMIT_COOLDOWN_MS;
  const failureCooldown = options.failureCooldownMs ?? AVATAR_FAILURE_COOLDOWN_MS;
  const maxEntries = options.maxEntries ?? AVATAR_MAX_ENTRIES;

  let entries: Record<string, AvatarCacheEntry> = {};
  try {
    entries = { ...(options.store?.load() ?? {}) };
  } catch {
    entries = {};
  }
  const inFlight = new Map<string, Promise<string | null>>();
  const triedShas = new Map<string, number>();
  const failedUntil = new Map<string, number>();
  let pausedUntil = 0;
  let active = 0;
  const queue: Array<() => void> = [];

  const persist = () => {
    if (!options.store) return;
    const keys = Object.keys(entries);
    if (keys.length > maxEntries) {
      keys
        .sort((a, b) => entries[a].at - entries[b].at)
        .slice(0, keys.length - maxEntries)
        .forEach((key) => delete entries[key]);
    }
    try {
      options.store.save(entries);
    } catch {
      return;
    }
  };

  const fresh = (key: string): AvatarCacheEntry | undefined => {
    const entry = entries[key];
    if (!entry) return undefined;
    const ttl = entry.url ? hitTtl : missTtl;
    return now() - entry.at < ttl ? entry : undefined;
  };

  const runLimited = <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const start = () => {
        active += 1;
        task()
          .then(resolve, reject)
          .finally(() => {
            active -= 1;
            queue.shift()?.();
          });
      };
      if (active < concurrency) start();
      else queue.push(start);
    });

  const record = (key: string, url: string | null) => {
    entries[key] = { url, at: now() };
    persist();
  };

  return {
    cached(email) {
      const key = normalizeAvatarEmail(email);
      if (!key) return null;
      const entry = fresh(key);
      return entry ? entry.url : undefined;
    },
    resolve(email, sha, context) {
      const key = normalizeAvatarEmail(email);
      if (!key || !sha) return Promise.resolve(null);
      const entry = fresh(key);
      if (entry) return Promise.resolve(entry.url);
      const pending = inFlight.get(key);
      if (pending) return pending;
      if (now() < pausedUntil) return Promise.resolve(null);
      if ((failedUntil.get(key) ?? 0) > now()) return Promise.resolve(null);
      if ((triedShas.get(key) ?? 0) >= maxShas) return Promise.resolve(null);

      const promise = runLimited(async () => {
        if (now() < pausedUntil) return null;
        triedShas.set(key, (triedShas.get(key) ?? 0) + 1);
        try {
          const url = safeAvatarUrl(await options.lookup(email, sha, context));
          record(key, url);
          triedShas.delete(key);
          return url;
        } catch (error) {
          if (isRateLimited(error)) {
            pausedUntil = now() + rateLimitCooldown;
            triedShas.set(key, (triedShas.get(key) ?? 1) - 1);
          } else if (!isMissingCommit(error)) {
            failedUntil.set(key, now() + failureCooldown);
          }
          return null;
        }
      }).finally(() => inFlight.delete(key));
      inFlight.set(key, promise);
      return promise;
    },
    clear() {
      entries = {};
      inFlight.clear();
      triedShas.clear();
      failedUntil.clear();
      pausedUntil = 0;
      persist();
    },
  };
}
