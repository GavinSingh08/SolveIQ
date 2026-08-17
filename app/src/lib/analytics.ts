const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function todayUTC() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export type MonthPoint = { label: string; count: number };

// Trailing 12 calendar months (not 12 fixed 30-day chunks), so each bucket
// lines up with a real month a reader can name, ending with the current
// (still in-progress) month.
export function computeMonthlyTrend(calendar: Record<string, number>): MonthPoint[] {
  const today = new Date(todayUTC());
  const months: MonthPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() - i;
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 1));

    let count = 0;
    for (let ts = monthStart.getTime(); ts < monthEnd.getTime(); ts += DAY_MS) {
      count += calendar[String(Math.floor(ts / 1000))] ?? 0;
    }

    months.push({ label: MONTH_LABELS[monthStart.getUTCMonth()], count });
  }

  return months;
}

export type WeekdayPoint = { label: string; count: number };

// Uses every day in the stored calendar (not just the last 12 months), so
// the pattern reflects as much real history as we have rather than a
// recency-biased slice.
export function computeDayOfWeekPattern(calendar: Record<string, number>): WeekdayPoint[] {
  const totals = new Array(7).fill(0);

  for (const [key, count] of Object.entries(calendar)) {
    const ts = Number(key) * 1000;
    const dow = new Date(ts).getUTCDay();
    totals[dow] += count;
  }

  return WEEKDAY_LABELS.map((label, i) => ({ label, count: totals[i] }));
}

export type WeekPoint = { start: Date; end: Date; count: number };

// Spans the *entire* stored calendar (up to ~2 years), bucketed into real
// Sunday-start weeks like the heatmap — a longer, coarser zoom level than
// both the daily heatmap (1 year) and Monthly Trend (12 months).
export function computeWeeklyActivity(calendar: Record<string, number>): WeekPoint[] {
  const keys = Object.keys(calendar).map(Number);
  if (keys.length === 0) return [];

  const today = todayUTC();
  const earliestTs = Math.min(...keys) * 1000;
  const earliestDow = new Date(earliestTs).getUTCDay();
  const gridStart = earliestTs - earliestDow * DAY_MS;

  const weeks: WeekPoint[] = [];
  for (let ws = gridStart; ws <= today; ws += 7 * DAY_MS) {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const ts = ws + d * DAY_MS;
      if (ts > today) break;
      count += calendar[String(Math.floor(ts / 1000))] ?? 0;
    }
    weeks.push({ start: new Date(ws), end: new Date(ws + 6 * DAY_MS), count });
  }

  return weeks;
}

export type ConsistencyStats = {
  longestStreak: number;
  activeDaysPct: number;
  totalActiveDays: number;
  avgPerActiveDay: number;
  bestDay: { count: number; date: Date } | null;
  bestWeek: { count: number; start: Date; end: Date } | null;
};

export function computeConsistencyStats(calendar: Record<string, number>): ConsistencyStats {
  const today = todayUTC();

  const entries = Object.entries(calendar)
    .map(([key, count]) => ({ ts: Number(key) * 1000, count }))
    .filter((e) => e.count > 0)
    .sort((a, b) => a.ts - b.ts);

  // Longest streak ever: walk sorted unique active days and track consecutive runs.
  let longestStreak = 0;
  let currentRun = 0;
  let prevDay: number | null = null;
  for (const e of entries) {
    currentRun = prevDay !== null && e.ts - prevDay === DAY_MS ? currentRun + 1 : 1;
    longestStreak = Math.max(longestStreak, currentRun);
    prevDay = e.ts;
  }

  const WINDOW_DAYS = 90;
  let activeDaysInWindow = 0;
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const ts = today - i * DAY_MS;
    if ((calendar[String(Math.floor(ts / 1000))] ?? 0) > 0) activeDaysInWindow++;
  }

  const totalActiveDays = entries.length;
  const totalSolved = entries.reduce((sum, e) => sum + e.count, 0);
  const avgPerActiveDay = totalActiveDays > 0 ? totalSolved / totalActiveDays : 0;

  let bestDay: { count: number; date: Date } | null = null;
  for (const e of entries) {
    if (!bestDay || e.count > bestDay.count) {
      bestDay = { count: e.count, date: new Date(e.ts) };
    }
  }

  // Best trailing 7-day window across the whole stored calendar, not just
  // the current one Weekly Pace already shows.
  let bestWeek: { count: number; start: Date; end: Date } | null = null;
  if (entries.length > 0) {
    for (let start = entries[0].ts; start <= today; start += DAY_MS) {
      let sum = 0;
      for (let d = 0; d < 7; d++) {
        sum += calendar[String(Math.floor((start + d * DAY_MS) / 1000))] ?? 0;
      }
      if (!bestWeek || sum > bestWeek.count) {
        bestWeek = { count: sum, start: new Date(start), end: new Date(start + 6 * DAY_MS) };
      }
    }
  }

  return {
    longestStreak,
    activeDaysPct: Math.round((activeDaysInWindow / WINDOW_DAYS) * 100),
    totalActiveDays,
    avgPerActiveDay: Math.round(avgPerActiveDay * 10) / 10,
    bestDay,
    bestWeek,
  };
}
