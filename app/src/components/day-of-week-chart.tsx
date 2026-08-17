'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { WeekdayPoint } from '@/lib/analytics';

export function DayOfWeekChart({ data }: { data: WeekdayPoint[] }) {
  const [active, setActive] = useState<{ label: string; count: number; x: number; y: number } | null>(null);

  const max = Math.max(1, ...data.map((d) => d.count));
  const peak = data.reduce((best, d) => (d.count > best.count ? d : best), data[0]);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <p className="text-3xl font-bold">{peak.label}</p>
        <p className="text-xs text-ink-soft mt-1">most active day</p>
      </div>

      <div className="flex items-end gap-1 h-10">
        {data.map((d) => {
          const isPeak = d.label === peak.label;
          const heightPct = Math.max(8, (d.count / max) * 100);
          const show = (e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setActive({ label: d.label, count: d.count, x: rect.left + rect.width / 2, y: rect.top });
          };
          return (
            <button
              key={d.label}
              type="button"
              onMouseEnter={show}
              onFocus={show}
              onMouseLeave={() => setActive(null)}
              onBlur={() => setActive(null)}
              className={`flex-1 rounded-t-[2px] transition-opacity hover:opacity-80 focus:opacity-80 focus:outline-none ${isPeak ? 'bg-accent-400' : 'bg-line'}`}
              style={{ height: `${heightPct}%` }}
              aria-label={`${d.label}: ${d.count} solved`}
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
            {active.count} solved · {active.label}
          </div>,
          document.body
        )}
    </div>
  );
}
