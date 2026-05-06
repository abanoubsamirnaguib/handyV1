import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDiscountPeriod, getOfferCountdownInfo, hasScheduledDiscountPeriod } from '@/lib/discount';

/**
 * Tiny countdown label for scheduled offers.
 * - Shows: يبدأ بعد / ينتهي بعد / انتهى العرض
 * - Adds title tooltip with full period.
 */
export default function OfferTimerLabel({ product, variant = 'card' }) {
  const enabled = hasScheduledDiscountPeriod(product);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  const info = useMemo(() => getOfferCountdownInfo(product, now), [product, now]);
  if (!enabled || !info) return null;

  const title = formatDiscountPeriod(product);
  const isCard = variant === 'card';

  const className = isCard
    ? 'bg-white/90 text-neutral-800 border border-neutral-200 text-[10px] px-2 py-0.5 shadow-sm max-w-full truncate'
    : 'bg-white text-neutral-800 border border-neutral-200 text-xs px-2 py-1 shadow-sm';

  const tone =
    info.state === 'ends_in' ? 'bg-emerald-600 text-white border-emerald-600' :
    info.state === 'starts_in' ? 'bg-amber-600 text-white border-amber-600' :
    'bg-neutral-700 text-white border-neutral-700';

  // Card: very small. Details: slightly bigger.
  return (
    <Badge
      variant="secondary"
      className={`${className} ${isCard ? '' : ''} ${isCard ? '' : ''} ${tone}`}
      title={title}
    >
      {info.label}
    </Badge>
  );
}

