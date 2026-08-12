'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

type Counts = { easy: number; medium: number; hard: number };
type Tier = { key: keyof Counts; label: string; barClass: string };

// Easy/Medium/Hard is an ordered tier (like S/M/L), not an arbitrary
// category, so it takes one hue with monotone steps rather than distinct
// hues per difficulty.
const TIERS: Tier[] = [
  { key: 'easy', label: 'Easy', barClass: 'bg-accent-400' },
  { key: 'medium', label: 'Medium', barClass: 'bg-accent-600' },
  { key: 'hard', label: 'Hard', barClass: 'bg-accent-800' },
];

function percentages(counts: Counts) {
  const total = counts.easy + counts.medium + counts.hard;
  if (total === 0) return { easy: 0, medium: 0, hard: 0 };
  return {
    easy: (counts.easy / total) * 100,
    medium: (counts.medium / total) * 100,
    hard: (counts.hard / total) * 100,
  };
}

type HoverHandler = (
  e: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>,
  tier: Tier,
  count: number,
  pct: number
) => void;

function Row({
  label,
  counts,
  onSegmentHover,
  onSegmentLeave,
}: {
  label: string;
  counts: Counts;
  onSegmentHover: HoverHandler;
  onSegmentLeave: () => void;
}) {
  const pct = percentages(counts);
  return (
    <div>
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <div className="flex h-6 rounded-[2px] overflow-hidden gap-[2px]">
        {TIERS.map((tier) => {
          const width = pct[tier.key];
          if (width <= 0) return null;
          return (
            <div
              key={tier.key}
              tabIndex={0}
              className={`${tier.barClass} focus:outline-none focus:brightness-110 hover:brightness-110`}
              style={{ width: `${width}%` }}
              onMouseEnter={(e) => onSegmentHover(e, tier, counts[tier.key], width)}
              onFocus={(e) => onSegmentHover(e, tier, counts[tier.key], width)}
              onMouseLeave={onSegmentLeave}
              onBlur={onSegmentLeave}
              aria-label={`${tier.label}: ${counts[tier.key]} (${width.toFixed(0)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
}

export function DifficultyBreakdown({ yours, catalog }: { yours: Counts; catalog: Counts }) {
  const [active, setActive] = useState<{ label: string; count: number; pct: number; x: number; y: number } | null>(null);

  const handleHover: HoverHandler = (e, tier, count, pct) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActive({ label: tier.label, count, pct, x: rect.left + rect.width / 2, y: rect.top });
  };
  const handleLeave = () => setActive(null);

  return (
    <div className="flex flex-col gap-4 h-full justify-center">
      <Row label="Your solves" counts={yours} onSegmentHover={handleHover} onSegmentLeave={handleLeave} />
      <Row label="LeetCode overall" counts={catalog} onSegmentHover={handleHover} onSegmentLeave={handleLeave} />

      <div className="flex items-center gap-3 text-[10px] text-ink-faint">
        {TIERS.map((tier) => (
          <span key={tier.key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-[1px] ${tier.barClass}`} />
            {tier.label}
          </span>
        ))}
      </div>

      {active &&
        createPortal(
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full bg-surface border border-line rounded px-2 py-1 text-[10px] text-ink whitespace-nowrap shadow-lg pointer-events-none"
            style={{ left: active.x, top: active.y - 4 }}
          >
            {active.label}: {active.count} ({active.pct.toFixed(0)}%)
          </div>,
          document.body
        )}
    </div>
  );
}
