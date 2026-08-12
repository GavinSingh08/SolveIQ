import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ActivityHeatmap } from '@/components/activity-heatmap';
import { ProgressStat } from '@/components/progress-stat';
import { DifficultyBreakdown } from '@/components/difficulty-breakdown';
import { InfoTooltip } from '@/components/info-tooltip';
import { computeWeeklyProgress } from '@/lib/progress';
import { computeStreak } from '@/lib/streak';

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const [{ data: profile }, { data: stats }, { data: recentProblems }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('leetcode_username')
        .eq('id', user.id)
        .single(),
      supabase
        .from('user_stats')
        .select('easy_solved, medium_solved, hard_solved, topics, calendar, catalog_counts')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('recent_problems')
        .select('slug, display_name, difficulty, topics, solved_at')
        .eq('user_id', user.id)
        .order('solved_at', { ascending: false })
        .limit(5),
    ]);

  const easySolved = stats?.easy_solved ?? 0;
  const mediumSolved = stats?.medium_solved ?? 0;
  const hardSolved = stats?.hard_solved ?? 0;

  const statCards = [
    { label: 'Total Solved', value: easySolved + mediumSolved + hardSolved },
    { label: 'Easy', value: easySolved },
    { label: 'Medium', value: mediumSolved },
    { label: 'Hard', value: hardSolved },
  ];

  const topicEntries = Object.entries(
    (stats?.topics as Record<string, number>) ?? {}
  ).sort((a, b) => b[1] - a[1]);

  const weeklyProgress = computeWeeklyProgress(
    (stats?.calendar as Record<string, number>) ?? {}
  );

  const streak = computeStreak((stats?.calendar as Record<string, number>) ?? {});

  const catalogCounts = (stats?.catalog_counts as { easy: number; medium: number; hard: number } | null) ?? {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  return (
    <main className="h-screen px-8 py-6 max-w-7xl mx-auto flex flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.leetcode_username}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1 border ${
              streak > 0
                ? 'bg-accent-400/10 text-accent-400 border-accent-400/30'
                : 'bg-surface text-ink-faint border-line'
            }`}
          >
            <Flame size={14} className={streak > 0 ? 'fill-accent-400' : ''} />
            {streak}-day streak
          </span>
        </div>
        <p className="text-ink-soft text-sm mb-4">
          Here&apos;s your coding progress so far.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-lg p-4 border border-line"
          >
            <p className="text-xs text-ink-soft mb-1">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mb-4 shrink-0">
        <h2 className="text-sm font-semibold mb-2">Activity Heatmap</h2>
        <div className="bg-surface rounded-lg border border-line p-3">
          <ActivityHeatmap calendar={(stats?.calendar as Record<string, number>) ?? {}} />
        </div>
      </section>

      <div className="grid grid-cols-3 gap-4 mb-4 flex-1 min-h-0">
        <section className="flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-2 shrink-0">
            Weekly Pace
          </h2>
          <div className="bg-surface rounded-lg border border-line flex-1 p-4">
            <ProgressStat
              thisWeek={weeklyProgress.thisWeek}
              delta={weeklyProgress.delta}
              sparkline={weeklyProgress.sparkline}
            />
          </div>
        </section>
        <section className="flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-2 shrink-0 flex items-center gap-1.5">
            Difficulty Breakdown
            <InfoTooltip text="Your difficulty mix vs. LeetCode's overall difficulty mix." />
          </h2>
          <div className="bg-surface rounded-lg border border-line flex-1 p-4">
            <DifficultyBreakdown
              yours={{ easy: easySolved, medium: mediumSolved, hard: hardSolved }}
              catalog={catalogCounts}
            />
          </div>
        </section>
        <section className="flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-2 shrink-0">Topics</h2>
          <div className="bg-surface rounded-lg border border-line flex-1 overflow-y-auto p-3 space-y-2">
            {topicEntries.map(([topic, count]) => (
              <div
                key={topic}
                className="flex justify-between text-sm border-b border-line pb-2"
              >
                <span className="text-ink-soft">{topic}</span>
                <span className="text-ink-soft">{count}</span>
              </div>
            ))}
            {topicEntries.length === 0 && (
              <p className="text-ink-faint text-sm">No topic data yet.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <section className="flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-2 shrink-0">
            Recently Solved
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {recentProblems?.map((problem) => (
              <div
                key={problem.slug}
                className="bg-surface rounded-lg p-3 border border-line"
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">{problem.display_name}</p>
                  <span className="text-xs text-ink-soft">
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-xs text-ink-faint mt-1">
                  {new Date(problem.solved_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {(!recentProblems || recentProblems.length === 0) && (
              <p className="text-ink-faint text-sm">No recent activity yet.</p>
            )}
          </div>
          <Link
            href="/dashboard/problems"
            className="inline-block self-start mt-2 text-xs text-accent-400 border border-accent-400/40 rounded-lg px-3 py-1.5 hover:bg-accent-400/10 transition-colors shrink-0"
          >
            View All Problems &rarr;
          </Link>
        </section>

        <section className="flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-2 shrink-0">AI Insights</h2>
          <div className="bg-surface rounded-lg border border-line flex-1 flex items-center justify-center">
            <p className="text-ink-faint text-sm">AI insights placeholder</p>
          </div>
        </section>
      </div>
    </main>
  );
}
