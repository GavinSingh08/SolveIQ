import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flame, type LucideIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MonthlyTrendChart } from '@/components/monthly-trend-chart';
import { DayOfWeekChart } from '@/components/day-of-week-chart';
import { WeeklyActivityStrip } from '@/components/weekly-activity-strip';
import { RadialMeter } from '@/components/radial-meter';
import {
  computeMonthlyTrend,
  computeDayOfWeekPattern,
  computeWeeklyActivity,
  computeConsistencyStats,
} from '@/lib/analytics';
import { computeStreak } from '@/lib/streak';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };

function StatTile({
  value,
  label,
  icon: Icon,
  iconFilled,
}: {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  iconFilled?: boolean;
}) {
  return (
    <div className="bg-surface rounded-lg border border-line p-3 flex flex-col justify-center">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon size={20} className={`text-accent-400 ${iconFilled ? 'fill-accent-400' : ''}`} />
        )}
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <p className="text-xs text-ink-soft mt-1">{label}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: stats } = await supabase
    .from('user_stats')
    .select('calendar, topics')
    .eq('user_id', user.id)
    .single();

  const calendar = (stats?.calendar as Record<string, number>) ?? {};
  const topics = (stats?.topics as Record<string, number>) ?? {};

  const monthlyTrend = computeMonthlyTrend(calendar);
  const dayOfWeek = computeDayOfWeekPattern(calendar);
  const weeklyActivity = computeWeeklyActivity(calendar);
  const consistency = computeConsistencyStats(calendar);
  const currentStreak = computeStreak(calendar);
  const distinctTopics = Object.keys(topics).length;

  return (
    <main className="h-screen px-8 py-6 max-w-5xl mx-auto flex flex-col overflow-hidden">
      <div className="shrink-0">
        <Link
          href="/dashboard"
          className="text-xs text-accent-400 hover:opacity-80"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-1">Analytics</h1>
        <p className="text-ink-soft text-sm mb-6">
          Deeper patterns in your solving activity.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
        <section>
          <div className="grid grid-cols-3 gap-4">
            <StatTile value={currentStreak} label="current streak (days)" icon={Flame} iconFilled />
            <StatTile value={consistency.longestStreak} label="longest streak ever" icon={Flame} />
            <div className="bg-surface rounded-lg border border-line p-3 flex items-center justify-center">
              <RadialMeter percent={consistency.activeDaysPct} label="active in last 90 days" />
            </div>
            <StatTile value={consistency.totalActiveDays} label="total active days" />
            <StatTile value={consistency.avgPerActiveDay} label="avg solves / active day" />
            <StatTile
              value={consistency.bestDay?.count ?? 0}
              label={
                consistency.bestDay
                  ? `best day (${consistency.bestDay.date.toLocaleDateString('en-US', DATE_FORMAT)})`
                  : 'best day'
              }
            />
            <StatTile
              value={consistency.bestWeek?.count ?? 0}
              label={
                consistency.bestWeek
                  ? `best week (${consistency.bestWeek.start.toLocaleDateString('en-US', DATE_FORMAT)}–${consistency.bestWeek.end.toLocaleDateString('en-US', DATE_FORMAT)})`
                  : 'best week'
              }
            />
            <StatTile value={distinctTopics} label="topics practiced" />
            <div className="bg-surface rounded-lg border border-line p-3">
              <DayOfWeekChart data={dayOfWeek} />
            </div>
          </div>
        </section>

        <section className="bg-surface rounded-lg border border-line p-4">
          <h2 className="text-sm font-semibold mb-3">Monthly Trend</h2>
          <MonthlyTrendChart data={monthlyTrend} />
        </section>

        <section className="bg-surface rounded-lg border border-line p-4">
          <h2 className="text-sm font-semibold mb-3">Weekly Activity, All-Time</h2>
          <WeeklyActivityStrip weeks={weeklyActivity} />
        </section>
      </div>
    </main>
  );
}
