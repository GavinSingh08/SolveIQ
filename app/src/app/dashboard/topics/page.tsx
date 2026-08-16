import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TopicsExplorer } from '@/components/topics-explorer';

export default async function TopicsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const [{ data: stats }, { data: problems }] = await Promise.all([
    supabase
      .from('user_stats')
      .select('topics, easy_solved, medium_solved, hard_solved')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('recent_problems')
      .select('slug, display_name, difficulty, topics, solved_at')
      .eq('user_id', user.id)
      .order('solved_at', { ascending: false }),
  ]);

  const topics = Object.entries(
    (stats?.topics as Record<string, number>) ?? {}
  ).sort((a, b) => b[1] - a[1]);

  const totalSolved =
    (stats?.easy_solved ?? 0) + (stats?.medium_solved ?? 0) + (stats?.hard_solved ?? 0);

  return (
    <main className="h-screen px-8 py-6 max-w-5xl mx-auto flex flex-col overflow-hidden">
      <div className="shrink-0">
        <Link
          href="/dashboard"
          className="text-xs text-accent-400 hover:opacity-80"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-1">Topics</h1>
        <p className="text-ink-soft text-sm mb-6">
          Every topic you&apos;ve solved problems in, ranked by practice volume.
        </p>
      </div>

      <TopicsExplorer topics={topics} problems={problems ?? []} totalSolved={totalSolved} />
    </main>
  );
}
