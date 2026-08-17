'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MonthPoint } from '@/lib/analytics';

const HEIGHT = 140;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

type Point = { x: number; y: number };

// Catmull-Rom-style smoothing: each segment's control points are derived
// from the line between its neighbors, so the curve passes through every
// real data point (unlike a fitted spline) while still looking smooth
// rather than kinked at each point.
function lineBetween(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) };
}

function controlPoint(current: Point, previous: Point | undefined, next: Point | undefined, reverse: boolean, smoothing: number) {
  const p = previous ?? current;
  const n = next ?? current;
  const { length, angle: baseAngle } = lineBetween(p, n);
  const angle = baseAngle + (reverse ? Math.PI : 0);
  return {
    x: current.x + Math.cos(angle) * length * smoothing,
    y: current.y + Math.sin(angle) * length * smoothing,
  };
}

function smoothPath(points: Point[], smoothing = 0.18) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  return points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const cps = controlPoint(points[i - 1], points[i - 2], point, false, smoothing);
    const cpe = controlPoint(point, points[i - 1], points[i + 1], true, smoothing);
    return `${path} C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
  }, '');
}

export function MonthlyTrendChart({ data }: { data: MonthPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<{ index: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(1, ...data.map((d) => d.count));
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: PAD_TOP + (1 - d.count / max) * plotHeight,
  }));

  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${PAD_TOP + plotHeight} L ${points[0].x},${PAD_TOP + plotHeight} Z`
      : '';

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (width === 0 || stepX === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const index = Math.max(0, Math.min(data.length - 1, Math.round(relX / stepX)));
    const point = points[index];
    setActive({ index, x: rect.left + point.x, y: rect.top + point.y });
  };

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        width={width}
        height={HEIGHT}
        onMouseMove={handleMove}
        onMouseLeave={() => setActive(null)}
        className="overflow-visible"
      >
        {/* Recessive reference line at the baseline */}
        <line
          x1={0}
          y1={PAD_TOP + plotHeight}
          x2={width}
          y2={PAD_TOP + plotHeight}
          stroke="var(--line)"
          strokeWidth={1}
        />

        {areaPath && <path d={areaPath} fill="var(--accent-400)" fillOpacity={0.1} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-400)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {active && (
          <line
            x1={points[active.index].x}
            y1={PAD_TOP}
            x2={points[active.index].x}
            y2={PAD_TOP + plotHeight}
            stroke="var(--ink-faint)"
            strokeWidth={1}
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={active?.index === i ? 4 : 0}
            fill="var(--accent-400)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}

        {data.map((d, i) => (
          <text
            key={d.label + i}
            x={i * stepX}
            y={HEIGHT - 6}
            textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
            className="fill-ink-faint"
            fontSize={10}
          >
            {d.label}
          </text>
        ))}
      </svg>

      {active &&
        createPortal(
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full bg-surface border border-line rounded px-2 py-1 text-[10px] text-ink whitespace-nowrap shadow-lg pointer-events-none"
            style={{ left: active.x, top: active.y - 8 }}
          >
            {data[active.index].count} solved · {data[active.index].label}
          </div>,
          document.body
        )}
    </div>
  );
}
