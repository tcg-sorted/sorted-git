import {
  createAvatarResolver,
  type AvatarCacheEntry,
  type AvatarResolver,
  type ForgeRemote,
} from '@angkorgit/core';
import { useSettings } from '@/features/settings/store';
import { useRepo } from '@/features/repository/store';
import { forgeProviderFor, useForge } from './store';

const STORAGE_PREFIX = 'angkorgit-avatars:';

interface LookupContext {
  repoPath: string;
  remote: ForgeRemote;
}

const resolvers = new Map<string, AvatarResolver<LookupContext>>();

function storeFor(host: string) {
  const key = `${STORAGE_PREFIX}${host.toLowerCase()}`;
  return {
    load(): Record<string, AvatarCacheEntry> {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, AvatarCacheEntry>) : {};
    },
    save(entries: Record<string, AvatarCacheEntry>) {
      localStorage.setItem(key, JSON.stringify(entries));
    },
  };
}

function resolverFor(host: string): AvatarResolver<LookupContext> {
  const id = host.toLowerCase();
  let resolver = resolvers.get(id);
  if (!resolver) {
    resolver = createAvatarResolver<LookupContext>({
      lookup: async (email, sha, { repoPath, remote }) => {
        const provider = forgeProviderFor(repoPath, remote);
        if (!provider) return null;
        return provider.authorAvatar({ email, sha });
      },
      store: storeFor(host),
    });
    resolvers.set(id, resolver);
  }
  return resolver;
}

function activeContext(): LookupContext | null {
  const { repoPath, remote, hasAccount } = useForge.getState();
  if (!repoPath || !remote || !hasAccount || !useSettings.getState().showPullRequests) return null;
  return { repoPath, remote };
}

export function forgeAvatarKey(state: ReturnType<typeof useForge.getState>): string {
  return state.hasAccount && state.remote ? `${state.repoPath}|${state.remote.host}` : '';
}

export function cachedForgeAvatar(email: string): string | null {
  const context = activeContext();
  if (!context || !email) return null;
  return resolverFor(context.remote.host).cached(email) ?? null;
}

export function forgeAvatarFor(email: string, sha: string): Promise<string | null> | null {
  const context = activeContext();
  if (!context || !email) return null;
  const resolver = resolverFor(context.remote.host);
  const cached = resolver.cached(email);
  if (cached !== undefined) return Promise.resolve(cached);
  if (!sha || /^0+$/.test(sha) || useRepo.getState().unpushed.includes(sha)) return null;
  return resolver.resolve(email, sha, context);
}
