import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'handy_promo_banner_dismiss';
/** Hide duration after user closes the banner (ms) */
const DISMISS_COOLDOWN_MS = 60 * 60 * 1000;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function useCountdown(endIso) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endIso) return undefined;
    const end = new Date(endIso).getTime();
    if (Number.isNaN(end)) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endIso]);

  return useMemo(() => {
    if (!endIso) return null;
    const end = new Date(endIso).getTime();
    if (Number.isNaN(end)) return null;
    const diff = Math.max(0, end - now);
    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds, expired: diff <= 0 };
  }, [endIso, now]);
}

function isWithinDismissCooldown(revision) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || String(parsed.r) !== String(revision)) return false;
    const at = parsed.at;
    if (typeof at !== 'number' || Number.isNaN(at)) {
      return false;
    }
    return Date.now() - at < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function setDismissed(revision) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ r: String(revision), at: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

const PromoBanner = () => {
  const { settings } = useSiteSettings();
  const promo = settings.promoBanner;
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [cooldownTick, setCooldownTick] = useState(0);

  const countdown = useCountdown(promo?.timerEnd);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const revision = promo?.revision ?? '0';

  // When the user is in the 1h hide window, re-render once the hour is over so the banner can show again.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (!parsed || String(parsed.r) !== String(revision)) return undefined;
      const at = parsed.at;
      if (typeof at !== 'number' || Number.isNaN(at)) return undefined;
      const elapsed = Date.now() - at;
      if (elapsed >= DISMISS_COOLDOWN_MS) return undefined;
      const remaining = DISMISS_COOLDOWN_MS - elapsed;
      const id = window.setTimeout(
        () => setCooldownTick((n) => n + 1),
        remaining + 100
      );
      return () => window.clearTimeout(id);
    } catch {
      return undefined;
    }
  }, [revision, cooldownTick]);

  const persistDismiss = useCallback(() => {
    setDismissed(revision);
  }, [revision]);

  const requestDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  const hasContent =
    promo?.enabled &&
    (promo?.title?.trim() || promo?.description?.trim());

  // After the 1h cooldown ends, `open` must be true again (it stayed false from the last dismiss).
  useLayoutEffect(() => {
    if (!hasContent) return;
    if (isWithinDismissCooldown(revision)) return;
    setOpen(true);
  }, [hasContent, revision, cooldownTick]);

  if (!hasContent || isWithinDismissCooldown(revision)) {
    return null;
  }

  const linkUrl = (promo?.linkUrl || '').trim();
  const showTimer = Boolean(promo?.timerEnd?.trim()) && countdown && !countdown.expired;

  const inner = (
    <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-violet-950/95 via-fuchsia-900/90 to-indigo-950/95 text-white shadow-[0_8px_32px_rgba(88,28,135,0.35)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.5) 0, transparent 35%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container relative mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex items-start gap-2 md:items-center">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 shadow-inner">
              <Sparkles className="h-5 w-5 text-amber-200" />
            </span>
            <div className="min-w-0 flex-1">
              {promo.title?.trim() && (
                <h2 className="text-sm font-bold leading-snug tracking-tight text-white md:text-base">
                  {promo.title.trim()}
                </h2>
              )}
              {promo.description?.trim() && (
                <p className="mt-0.5 text-xs leading-relaxed text-violet-100/90 md:text-sm">
                  {promo.description.trim()}
                </p>
              )}
            </div>
          </div>

          {showTimer && (
            <div className="flex flex-wrap items-center gap-2 md:shrink-0">
              <span className="text-[10px] font-medium uppercase tracking-wider text-violet-200/80 md:text-xs">
                ينتهي خلال
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: 'يوم', value: pad2(countdown.days) },
                  { label: 'ساعة', value: pad2(countdown.hours) },
                  { label: 'دقيقة', value: pad2(countdown.minutes) },
                  { label: 'ثانية', value: pad2(countdown.seconds) },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="flex min-w-[3rem] flex-col items-center rounded-lg bg-black/25 px-2 py-1 ring-1 ring-white/10"
                  >
                    <span className="font-mono text-lg font-semibold tabular-nums leading-none">
                      {unit.value}
                    </span>
                    <span className="mt-0.5 text-[9px] text-violet-200/80">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 md:justify-end">
          {linkUrl && (
            <>
              {linkUrl.startsWith('/') ? (
                <Button
                  asChild
                  size="sm"
                  className="rounded-full border-0 bg-white/15 text-white shadow-lg ring-1 ring-white/25 hover:bg-white/25"
                >
                  <Link to={linkUrl}>اكتشف العرض</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="rounded-full border-0 bg-white/15 text-white shadow-lg ring-1 ring-white/25 hover:bg-white/25"
                  asChild
                >
                  <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                    اكتشف العرض
                  </a>
                </Button>
              )}
            </>
          )}
          {isMobile && (
            <span className="flex items-center gap-0.5 text-[10px] text-violet-200/70 md:hidden">
              <ChevronRight className="h-3 w-3 opacity-70" />
              اسحب للإغلاق
              <ChevronLeft className="h-3 w-3 opacity-70" />
            </span>
          )}
          <button
            type="button"
            onClick={requestDismiss}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label="إغلاق البانر"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence onExitComplete={persistDismiss}>
      {open && (
        <motion.div
          key="promo-banner"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 120 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          drag={isMobile ? 'x' : false}
          dragConstraints={{ left: -140, right: 140 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (!isMobile) return;
            if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 400) {
              requestDismiss();
            }
          }}
          className="relative z-40 overflow-hidden"
        >
          {inner}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoBanner;
