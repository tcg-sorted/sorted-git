import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sizedAvatarUrl } from '@angkorgit/core';
import { cn } from '@angkorgit/design-system';
import { avatarHue, initials } from '@/shared/utils';
import { cachedForgeAvatar, forgeAvatarFor, forgeAvatarKey } from '@/features/forge/avatars';
import { useForge } from '@/features/forge/store';
import { useSettings } from '@/features/settings/store';

const brokenUrls = new Set<string>();

function usable(url: string | null, size: number): string | null {
  if (!url || brokenUrls.has(url)) return null;
  return sizedAvatarUrl(url, size * 2);
}

export const Avatar = memo(function Avatar({
  name,
  email,
  oid,
  size = 20,
  className,
  title,
}: {
  name: string;
  email: string;
  oid?: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const forgeKey = useForge(forgeAvatarKey);
  const forgeEnabled = useSettings((s) => s.showPullRequests);
  const [source, setSource] = useState<string | null>(() => cachedForgeAvatar(email));
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const url = usable(source, size);

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [url]);

  useEffect(() => {
    let cancelled = false;
    const cached = cachedForgeAvatar(email);
    setSource(cached);
    setLoaded(false);
    if (cached || !email || !oid) return;
    const pending = forgeAvatarFor(email, oid);
    if (pending) {
      void pending.then((resolved) => {
        if (!cancelled && resolved) setSource(resolved);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [email, oid, forgeKey, forgeEnabled]);

  return (
    <span
      className={cn(
        'relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `hsl(${avatarHue(email)} 45% 45%)`,
        fontSize: Math.max(8, Math.round(size * 0.42)),
      }}
      title={title ?? `${name} <${email}>`}
      aria-label={name}
    >
      {initials(name)}
      {url && (
        <img
          ref={imgRef}
          src={url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-150',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (source) brokenUrls.add(source);
            setSource(null);
          }}
        />
      )}
    </span>
  );
});
