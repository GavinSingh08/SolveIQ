'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { WeekBucket } from '@/lib/progress';

type Props = {
  thisWeek: number;
  delta: number;
  sparkline: WeekBucket[];
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };

function formatRange(start: Date, end: Date) {
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startLabel = start.toLocaleDateString('en-US', sameMonth ? { day: 'numeric', timeZone: 'UTC' } : DATE_FORMAT);
  const endLabel = end.toLocaleDateString('en-US', DATE_FORMAT);
  return `${startLabel}–${endLabel}`;
}

export function ProgressStat({ thisWeek, delta, sparkline }: Props) {
  const [active, setActive] = useState<{ count: number; label: string; x: number; y: number } | null>(null);

  const max = Math.max(1, ...sparkline.map((week) => week.count));
  const deltaLabel =
    delta === 0
      ? 'Same as last week'
      : delta > 0
        ? `+${delta} vs last week`
        : `${delta} vs last week`;
  const deltaClass = delta > 0 ? 'text-accent-400' : 'text-ink-faint';

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <p className="text-3xl font-bold">{thisWeek}</p>
        <p className="text-xs text-ink-soft mt-1">solved this week</p>
        <p className={`text-xs mt-2 ${deltaClass}`}>{deltaLabel}</p>
      </div>

      <div className="flex items-end gap-1 h-10">
        {sparkline.map((week, i) => {
          const isCurrent = i === sparkline.length - 1;
          const height = Math.max(8, (week.count / max) * 100);
          const label = isCurrent ? 'This week' : formatRange(week.start, week.end);
          const show = (e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setActive({ count: week.count, label, x: rect.left + rect.width / 2, y: rect.top });
          };
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={show}
              onFocus={show}
              onMouseLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              className={`flex-1 rounded-t-[2px] transition-opacity hover:opacity-80 focus:opacity-80 focus:outline-none ${isCurrent ? 'bg-accent-400' : 'bg-line'}`}
              style={{ height: `${height}%` }}
              aria-label={`${week.count} solved, ${label}`}
            />
          );
        })}
      </div>

      {active &&
        createPortal(
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full bg-surface border border-line rounded px-2 py-1 text-[10px] text-ink whitespace-nowrap shadow-lg pointer-events-none"
            style={{ left: active.x, top: active.y - 4 }}
          >
            {active.count} {active.count === 1 ? 'problem' : 'problems'} · {active.label}
          </div>,
          document.body
        )}
    </div>
  );
}
