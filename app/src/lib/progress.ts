const DAY_MS = 24 * 60 * 60 * 1000;
const SPARKLINE_WEEKS = 8;

export type WeekBucket = {
  count: number;
  start: Date;
  end: Date;
};

// Trailing 7-day windows rather than calendar weeks (Sun-Sat) — comparing
// two full 7-day periods is always apples-to-apples, unlike comparing a
// partial in-progress calendar week against a completed one.
export function computeWeeklyProgress(calendar: Record<string, number>) {
  const todayUTC = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );

  const countForDay = (daysAgo: number) => {
    const ts = todayUTC - daysAgo * DAY_MS;
    return calendar[String(Math.floor(ts / 1000))] ?? 0;
  };

  const sumRange = (startDaysAgo: number, endDaysAgo: number) => {
    let total = 0;
    for (let d = startDaysAgo; d <= endDaysAgo; d++) total += countForDay(d);
    return total;
  };

  const thisWeek = sumRange(0, 6);
  const lastWeek = sumRange(7, 13);
  const delta = thisWeek - lastWeek;

  // Oldest to newest; the last entry is the current (still in-progress) week.
  const sparkline: WeekBucket[] = Array.from({ length: SPARKLINE_WEEKS }, (_, i) => {
    const weeksAgo = SPARKLINE_WEEKS - 1 - i;
    const startDaysAgo = weeksAgo * 7 + 6;
    const endDaysAgo = weeksAgo * 7;
    return {
      count: sumRange(endDaysAgo, startDaysAgo),
      start: new Date(todayUTC - startDaysAgo * DAY_MS),
      end: new Date(todayUTC - endDaysAgo * DAY_MS),
    };
  });

  return { thisWeek, delta, sparkline };
}
