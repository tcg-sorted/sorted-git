import { describe, expect, it, vi } from 'vitest';
import { ForgeError, createAvatarResolver, sizedAvatarUrl, type AvatarCacheEntry } from '@angkorgit/core';

const AVATAR = 'https://avatars.githubusercontent.com/u/1?v=4';

function memoryStore(initial: Record<string, AvatarCacheEntry> = {}) {
  let saved = initial;
  return {
    load: () => saved,
    save: (entries: Record<string, AvatarCacheEntry>) => {
      saved = { ...entries };
    },
    get saved() {
      return saved;
    },
  };
}

describe('createAvatarResolver', () => {
  it('asks once per email however many commits share it', async () => {
    const lookup = vi.fn(async () => AVATAR);
    const resolver = createAvatarResolver({ lookup });
    const results = await Promise.all([
      resolver.resolve('Dara@Example.com', 'a1', undefined),
      resolver.resolve('dara@example.com ', 'a2', undefined),
      resolver.resolve('dara@example.com', 'a3', undefined),
    ]);
    expect(results).toEqual([AVATAR, AVATAR, AVATAR]);
    expect(await resolver.resolve('dara@example.com', 'a4', undefined)).toBe(AVATAR);
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(resolver.cached('DARA@example.com')).toBe(AVATAR);
  });

  it('persists hits and misses and serves them without a request', async () => {
    const store = memoryStore();
    const lookup = vi.fn(async (email: string) => (email.startsWith('dara') ? AVATAR : null));
    const first = createAvatarResolver({ lookup, store });
    await first.resolve('dara@example.com', 'a1', undefined);
    await first.resolve('ghost@example.com', 'a2', undefined);
    expect(store.saved['dara@example.com'].url).toBe(AVATAR);
    expect(store.saved['ghost@example.com'].url).toBeNull();

    const again = vi.fn(async () => AVATAR);
    const second = createAvatarResolver({ lookup: again, store });
    expect(await second.resolve('dara@example.com', 'b1', undefined)).toBe(AVATAR);
    expect(await second.resolve('ghost@example.com', 'b2', undefined)).toBeNull();
    expect(second.cached('ghost@example.com')).toBeNull();
    expect(again).not.toHaveBeenCalled();
  });

  it('asks again once a cached entry expires', async () => {
    let now = 0;
    const lookup = vi.fn(async () => null);
    const resolver = createAvatarResolver({ lookup, now: () => now, missTtlMs: 100 });
    await resolver.resolve('ghost@example.com', 'a1', undefined);
    now = 50;
    expect(resolver.cached('ghost@example.com')).toBeNull();
    now = 150;
    expect(resolver.cached('ghost@example.com')).toBeUndefined();
    await resolver.resolve('ghost@example.com', 'a2', undefined);
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it('tries another commit when the forge does not know one, up to a limit', async () => {
    const lookup = vi.fn(async (_email: string, sha: string) => {
      if (sha !== 'pushed') throw new ForgeError('GitHub request failed (422)', 'github', 422);
      return AVATAR;
    });
    const resolver = createAvatarResolver({ lookup, maxShasPerEmail: 3 });
    expect(await resolver.resolve('me@example.com', 'local1', undefined)).toBeNull();
    expect(resolver.cached('me@example.com')).toBeUndefined();
    expect(await resolver.resolve('me@example.com', 'pushed', undefined)).toBe(AVATAR);

    const capped = createAvatarResolver({ lookup, maxShasPerEmail: 2 });
    await capped.resolve('me@example.com', 'x1', undefined);
    await capped.resolve('me@example.com', 'x2', undefined);
    expect(await capped.resolve('me@example.com', 'pushed', undefined)).toBeNull();
    expect(lookup).toHaveBeenCalledTimes(4);
  });

  it('pauses every lookup after a rate limit until the cooldown ends', async () => {
    let now = 0;
    let limited = true;
    const lookup = vi.fn(async () => {
      if (limited) throw new ForgeError('GitHub request failed (403): API rate limit exceeded', 'github', 403);
      return AVATAR;
    });
    const resolver = createAvatarResolver({ lookup, now: () => now, rateLimitCooldownMs: 1000 });
    expect(await resolver.resolve('a@example.com', 's1', undefined)).toBeNull();
    expect(await resolver.resolve('b@example.com', 's2', undefined)).toBeNull();
    expect(lookup).toHaveBeenCalledTimes(1);
    limited = false;
    now = 1001;
    expect(await resolver.resolve('a@example.com', 's1', undefined)).toBe(AVATAR);
  });

  it('backs off an email after a network failure without caching a miss', async () => {
    let now = 0;
    const lookup = vi.fn(async () => {
      throw new Error('request failed: error sending request');
    });
    const resolver = createAvatarResolver({ lookup, now: () => now, failureCooldownMs: 500 });
    await resolver.resolve('a@example.com', 's1', undefined);
    await resolver.resolve('a@example.com', 's2', undefined);
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(resolver.cached('a@example.com')).toBeUndefined();
    now = 501;
    await resolver.resolve('a@example.com', 's3', undefined);
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it('keeps at most the configured number of requests in flight', async () => {
    let active = 0;
    let peak = 0;
    const lookup = vi.fn(async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return AVATAR;
    });
    const resolver = createAvatarResolver({ lookup, concurrency: 2 });
    await Promise.all(
      Array.from({ length: 8 }, (_, i) => resolver.resolve(`u${i}@example.com`, `s${i}`, undefined)),
    );
    expect(lookup).toHaveBeenCalledTimes(8);
    expect(peak).toBe(2);
  });

  it('drops non-https avatar urls and passes the lookup context through', async () => {
    const lookup = vi.fn(async (_email: string, _sha: string, context: { repo: string }) =>
      context.repo === 'a' ? 'http://insecure/avatar.png' : AVATAR,
    );
    const resolver = createAvatarResolver({ lookup });
    expect(await resolver.resolve('a@example.com', 's1', { repo: 'a' })).toBeNull();
    expect(await resolver.resolve('b@example.com', 's1', { repo: 'b' })).toBe(AVATAR);
    expect(lookup).toHaveBeenLastCalledWith('b@example.com', 's1', { repo: 'b' });
  });

  it('evicts the oldest persisted entries past the cap', async () => {
    let now = 0;
    const store = memoryStore();
    const resolver = createAvatarResolver({ lookup: async () => AVATAR, store, now: () => now++, maxEntries: 2 });
    await resolver.resolve('a@example.com', 's', undefined);
    await resolver.resolve('b@example.com', 's', undefined);
    await resolver.resolve('c@example.com', 's', undefined);
    expect(Object.keys(store.saved).sort()).toEqual(['b@example.com', 'c@example.com']);
  });

  it('survives a store that throws', async () => {
    const resolver = createAvatarResolver({
      lookup: async () => AVATAR,
      store: {
        load: () => {
          throw new Error('corrupt');
        },
        save: () => {
          throw new Error('quota');
        },
      },
    });
    expect(await resolver.resolve('a@example.com', 's', undefined)).toBe(AVATAR);
  });
});

describe('sizedAvatarUrl', () => {
  it('sets the size on GitHub avatar urls and leaves others alone', () => {
    expect(sizedAvatarUrl(AVATAR, 40)).toBe('https://avatars.githubusercontent.com/u/1?v=4&s=40');
    expect(sizedAvatarUrl('https://bitbucket.org/av.png', 40)).toBe('https://bitbucket.org/av.png');
    expect(sizedAvatarUrl('not a url', 40)).toBe('not a url');
  });
});
