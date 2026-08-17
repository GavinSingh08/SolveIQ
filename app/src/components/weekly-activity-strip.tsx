'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WeekPoint } from '@/lib/analytics';

const GAP = 2;
const MIN_CELL = 3;
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };

function buildTiers(counts: number[]) {
  const nonZero = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (nonZero.length === 0) return [0, 0, 0, 0];
  const at = (p: number) => nonZero[Math.min(nonZero.length - 1, Math.floor(p * nonZero.length))];
  return [at(0.2), at(0.4), at(0.6), at(0.8)];
}

function tierFor(count: number, thresholds: number[]) {
  if (count === 0) return 0;
  if (count <= thresholds[0]) return 1;
  if (count <= thresholds[1]) return 2;
  if (count <= thresholds[2]) return 3;
  if (count <= thresholds[3]) return 4;
  return 5;
}

const TIER_CLASS = ['bg-line', 'bg-accent-800', 'bg-accent-700', 'bg-accent-600', 'bg-accent-500', 'bg-accent-400'];

export function WeeklyActivityStrip({ weeks }: { weeks: WeekPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<{ week: WeekPoint; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const thresholds = buildTiers(weeks.map((w) => w.count));
  const cell = weeks.length > 0
    ? Math.max(MIN_CELL, (width - (weeks.length - 1) * GAP) / weeks.length)
    : MIN_CELL;

  if (weeks.length === 0) {
    return <p className="text-ink-faint text-sm">No activity tracked yet.</p>;
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex" style={{ gap: GAP }}>
        {weeks.map((week, i) => {
          const tier = tierFor(week.count, thresholds);
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActive({ week, x: rect.left + rect.width / 2, y: rect.top });
              }}
              onFocus={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setActive({ week, x: rect.left + rect.width / 2, y: rect.top });
              }}
              onMouseLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              className={`rounded-[1px] focus:outline-none hover:outline hover:outline-1 hover:outline-ink-soft ${TIER_CLASS[tier]}`}
              style={{ width: cell, height: 24 }}
              aria-label={`${week.count} solved, week of ${week.start.toLocaleDateString('en-US', DATE_FORMAT)}`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-[10px] text-ink-faint">
          {weeks[0].start.toLocaleDateString('en-US', DATE_FORMAT)} –{' '}
          {weeks[weeks.length - 1].end.toLocaleDateString('en-US', DATE_FORMAT)} ·{' '}
          {weeks.length} weeks
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-ink-faint">Less</span>
          {TIER_CLASS.map((cls) => (
            <span key={cls} className={`rounded-[1px] ${cls}`} style={{ width: 10, height: 10 }} />
          ))}
          <span className="text-[10px] text-ink-faint">More</span>
        </div>
      </div>

      {active &&
        createPortal(
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full bg-surface border border-line rounded px-2 py-1 text-[10px] text-ink whitespace-nowrap shadow-lg pointer-events-none"
            style={{ left: active.x, top: active.y - 4 }}
          >
            {active.week.count} solved · week of{' '}
            {active.week.start.toLocaleDateString('en-US', DATE_FORMAT)}
          </div>,
          document.body
        )}
    </div>
  );
}
