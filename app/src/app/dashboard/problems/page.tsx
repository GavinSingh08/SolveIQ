import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProblemsExplorer } from '@/components/problems-explorer';

export default async function ProblemsPage({
  searchParams,
}: PageProps<'/dashboard/problems'>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { topic } = await searchParams;

  const { data: problems } = await supabase
    .from('recent_problems')
    .select('slug, display_name, difficulty, topics, solved_at')
    .eq('user_id', user.id)
    .order('solved_at', { ascending: false });

  return (
    <main className="h-screen px-8 py-6 max-w-5xl mx-auto flex flex-col overflow-hidden">
      <div className="shrink-0">
        <Link
          href="/dashboard"
          className="text-xs text-accent-400 hover:opacity-80"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2 mb-1">All Problems</h1>
        <p className="text-ink-soft text-sm mb-6">
          Every problem we&apos;ve synced from your LeetCode activity.
        </p>
      </div>

      <ProblemsExplorer
        problems={problems ?? []}
        initialTopic={typeof topic === 'string' ? topic : undefined}
      />
    </main>
  );
}
