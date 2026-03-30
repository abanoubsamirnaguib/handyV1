import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const providerLabels = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

const providerBackgrounds = {
  youtube: 'from-red-500/90 to-red-700/90',
  vimeo: 'from-sky-500/90 to-sky-700/90',
  tiktok: 'from-neutral-700/90 to-black/90',
  facebook: 'from-blue-600/90 to-blue-800/90',
};

const EmbedCard = ({ embed }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const providerLabel = providerLabels[embed?.provider] || 'Video';
  const backgroundClass = providerBackgrounds[embed?.provider] || 'from-neutral-700/90 to-black/90';
  const thumbnailUrl = useMemo(() => embed?.thumbnail_url || null, [embed?.thumbnail_url]);
  const iframeSrc = useMemo(() => {
    if (!embed?.embed_url) {
      return '';
    }

    if (embed.provider !== 'facebook') {
      return embed.embed_url;
    }

    try {
      const url = new URL(embed.embed_url);
      const safeWidth = Math.max(240, Math.round(containerWidth || 320));
      const safeHeight = Math.round(safeWidth * 0.5625);

      url.searchParams.set('width', String(safeWidth));
      url.searchParams.set('height', String(safeHeight));
      return url.toString();
    } catch {
      return embed.embed_url;
    }
  }, [containerWidth, embed?.embed_url, embed?.provider]);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!embed?.embed_url) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 shadow-sm">
      <div className="relative w-full pt-[56.25%]">
        {isPlaying ? (
          <iframe
            src={iframeSrc}
            title={`${providerLabel} video`}
            className="absolute inset-0 h-full w-full max-w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            scrolling="no"
            style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full text-right"
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`${providerLabel} preview`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${backgroundClass}`}>
                <Video className="h-10 w-10 text-white/80" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-roman-500 shadow-lg">
                <Play className="mr-1 h-6 w-6 fill-current" />
              </span>
            </div>
            <Badge className="absolute right-3 top-3 bg-black/65 text-white hover:bg-black/65">
              {providerLabel}
            </Badge>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmbedCard;
