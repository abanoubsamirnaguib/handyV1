export function formatEgyptianDateTime(iso) {
  if (iso == null || iso === '') return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return new Intl.DateTimeFormat('ar-EG-u-ca-gregory', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Cairo',
    }).format(d);
  } catch {
    return String(iso);
  }
}

export function hasScheduledDiscountPeriod(product) {
  return (
    !!product &&
    (product.discount_type === 'percentage' || product.discount_type === 'fixed') &&
    product.discount_schedule === 'scheduled' &&
    !!product.discount_starts_at &&
    !!product.discount_ends_at
  );
}

export function formatDiscountPeriod(product) {
  if (!hasScheduledDiscountPeriod(product)) return '';
  return `فترة العرض: من ${formatEgyptianDateTime(product.discount_starts_at)} إلى ${formatEgyptianDateTime(product.discount_ends_at)}`;
}

function pad2(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function formatCountdownMs(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}:${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

export function getOfferCountdownInfo(product, now = new Date()) {
  if (!hasScheduledDiscountPeriod(product)) return null;
  const start = new Date(product.discount_starts_at);
  const end = new Date(product.discount_ends_at);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (nowMs < startMs) {
    return {
      state: 'starts_in',
      msLeft: startMs - nowMs,
      start,
      end,
      label: `يبدأ بعد ${formatCountdownMs(startMs - nowMs)}`,
    };
  }
  if (nowMs >= startMs && nowMs <= endMs) {
    return {
      state: 'ends_in',
      msLeft: endMs - nowMs,
      start,
      end,
      label: `ينتهي بعد ${formatCountdownMs(endMs - nowMs)}`,
    };
  }
  return {
    state: 'ended',
    msLeft: 0,
    start,
    end,
    label: 'انتهى العرض',
  };
}

