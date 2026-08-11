'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53;
const GAP = 3;
const MIN_CELL = 8;
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
};

// How much of the cell each intensity tier's dot fills — magnitude is
// encoded by both size and color, not color alone, so it reads at a glance
// and stays legible for anyone who can't distinguish the color steps.
const DOT_SCALE = [0.26, 0.45, 0.6, 0.75, 0.9, 1];
const TIER_CLASS = [
  'bg-line',
  'bg-accent-800',
  'bg-accent-700',
  'bg-accent-600',
  'bg-accent-500',
  'bg-accent-400',
];

type Cell = {
  date: Date;
  count: number;
  col: number;
  row: number;
  inRange: boolean;
};

// Tiers are quantiles of this user's own non-zero days, so the scale adapts
// to how active they are rather than using fixed thresholds tuned for
// someone else's pace.
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

export function ActivityHeatmap({ calendar }: { calendar: Record<string, number> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<{ date: Date; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { weeks, monthLabels, thresholds, totalSolved } = useMemo(() => {
    // Grid days are anchored to UTC boundaries, matching how LeetCode's
    // submission calendar keys its days — display formatting below must
    // stay in UTC too, or the labels drift a day off in local timezones.
    const todayUTC = Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    );
    // Anchor to the Sunday of *this* week, then step back (WEEKS - 1) full
    // weeks — anchoring from a fixed day-count first and aligning to Sunday
    // after the fact silently shrinks the range by the alignment shift and
    // can push today off the end of the grid.
    const todayDayOfWeek = new Date(todayUTC).getUTCDay();
    const currentWeekStart = todayUTC - todayDayOfWeek * DAY_MS;
    const gridStart = currentWeekStart - (WEEKS - 1) * 7 * DAY_MS;

    const cells: Cell[] = [];
    const allCounts: number[] = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const ts = gridStart + i * DAY_MS;
      const date = new Date(ts);
      const key = String(Math.floor(ts / 1000));
      const count = calendar[key] ?? 0;
      const inRange = ts <= todayUTC;
      if (inRange) allCounts.push(count);
      cells.push({ date, count, col: Math.floor(i / 7), row: i % 7, inRange });
    }

    const thresholds = buildTiers(allCounts);

    const weeks: Cell[][] = Array.from({ length: WEEKS }, () => []);
    cells.forEach((cell) => weeks[cell.col].push(cell));

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstDay = week[0].date;
      const month = firstDay.getUTCMonth();
      if (month !== lastMonth) {
        monthLabels.push({ col, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });

    const totalSolved = allCounts.reduce((sum, c) => sum + c, 0);

    return { weeks, monthLabels, thresholds, totalSolved };
  }, [calendar]);

  const cell = width > 0
    ? Math.max(MIN_CELL, (width - (WEEKS - 1) * GAP) / WEEKS)
    : MIN_CELL;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative" style={{ height: 14 }}>
        {monthLabels.map(({ col, label }) => (
          <span
            key={col}
            className="absolute text-[10px] text-ink-faint"
            style={{ left: col * (cell + GAP) }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${WEEKS}, ${cell}px)`,
          gridTemplateRows: `repeat(7, ${cell}px)`,
          gridAutoFlow: 'column',
          gap: GAP,
        }}
      >
        {weeks.flatMap((week) =>
          week.map((day) => {
            if (!day.inRange) {
              return <div key={day.date.toISOString()} style={{ width: cell, height: cell }} />;
            }
            const tier = tierFor(day.count, thresholds);
            const dotSize = cell * DOT_SCALE[tier];
            return (
              <button
                key={day.date.toISOString()}
                type="button"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActive({ date: day.date, count: day.count, x: rect.left + rect.width / 2, y: rect.top });
                }}
                onFocus={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setActive({ date: day.date, count: day.count, x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                className="group flex items-center justify-center focus:outline focus:outline-1 focus:outline-accent-400 rounded-full"
                style={{ width: cell, height: cell }}
                aria-label={`${day.count} submissions on ${day.date.toLocaleDateString('en-US', DATE_FORMAT)}`}
              >
                <span
                  className={`rounded-full transition-transform group-hover:scale-125 group-focus:scale-125 ${TIER_CLASS[tier]}`}
                  style={{ width: dotSize, height: dotSize }}
                />
              </button>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-[10px] text-ink-faint">{totalSolved} submissions in the last year</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-ink-faint">Less</span>
          {TIER_CLASS.map((cls, i) => (
            <span key={cls} className="flex items-center justify-center" style={{ width: 10, height: 10 }}>
              <span className={`rounded-full ${cls}`} style={{ width: 10 * DOT_SCALE[i], height: 10 * DOT_SCALE[i] }} />
            </span>
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
            {active.count} {active.count === 1 ? 'submission' : 'submissions'} on{' '}
            {active.date.toLocaleDateString('en-US', DATE_FORMAT)}
          </div>,
          document.body
        )}
    </div>
  );
}
