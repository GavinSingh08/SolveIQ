const DAY_MS = 24 * 60 * 60 * 1000;

// A streak stays "alive" through today even if today hasn't been solved yet
// (it only breaks once a full day passes with nothing solved) — matches how
// Duolingo/GitHub-style streaks behave, rather than requiring today's solve
// to already exist for the count to show.
export function computeStreak(calendar: Record<string, number>): number {
  const todayUTC = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );

  const countForDay = (daysAgo: number) => {
    const ts = todayUTC - daysAgo * DAY_MS;
    return calendar[String(Math.floor(ts / 1000))] ?? 0;
  };

  let startOffset = 0;
  if (countForDay(0) === 0) {
    if (countForDay(1) === 0) return 0;
    startOffset = 1;
  }

  let streak = 0;
  let daysAgo = startOffset;
  while (countForDay(daysAgo) > 0) {
    streak++;
    daysAgo++;
  }
  return streak;
}
