'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

type Problem = {
  slug: string;
  display_name: string;
  difficulty: string;
  topics: string[];
  solved_at: string;
};

type TopicEntry = [string, number];

const DIFFICULTY_CHIP: Record<string, string> = {
  Easy: 'bg-accent-400/10 text-accent-400',
  Medium: 'bg-accent-600/10 text-accent-600',
  Hard: 'bg-accent-800/10 text-accent-800',
};

// A whole-number round hides small-but-real shares (5/2000 rounds to "0%"),
// so anything under 1% keeps one decimal place instead.
function formatPct(count: number, total: number): string {
  if (total <= 0) return '0%';
  const pct = (count / total) * 100;
  if (pct > 0 && pct < 1) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

function TopicRow({
  topic,
  count,
  totalSolved,
  problems,
  isOpen,
  onToggle,
}: {
  topic: string;
  count: number;
  totalSolved: number;
  problems: Problem[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const coverageLabel = formatPct(count, totalSolved);
  // Clamped defensively: topics overlap (one problem can carry several tags),
  // so a topic's count can in principle exceed totalSolved.
  const barPct = totalSolved > 0 ? Math.min(100, (count / totalSolved) * 100) : 0;
  const matches = useMemo(
    () => problems.filter((p) => p.topics.includes(topic)),
    [problems, topic]
  );
  const tally = useMemo(() => {
    const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    matches.forEach((p) => {
      counts[p.difficulty] = (counts[p.difficulty] ?? 0) + 1;
    });
    return counts;
  }, [matches]);

  return (
    <div className="bg-surface rounded-lg border border-line overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left p-3"
      >
        <div className="flex justify-between items-center mb-1.5 text-sm">
          <span className="font-medium">{topic}</span>
          <span className="flex items-center gap-1.5 text-ink-soft text-xs">
            {count}
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </div>
        <div className="h-2 rounded-[2px] bg-line overflow-hidden">
          <div
            className="h-full bg-accent-400 rounded-[2px]"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            className={`p-3 space-y-3 border-t transition-colors duration-300 ${isOpen ? 'border-line' : 'border-transparent'}`}
          >
            <p className="text-sm text-ink-soft">
              {count} of {totalSolved} solves involve this topic ·{' '}
              <span className="text-accent-400 font-semibold">{coverageLabel}</span>
            </p>

            {matches.length > 0 ? (
              <>
                <div className="flex gap-2 text-[10px]">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <span key={d} className={`px-1.5 py-0.5 rounded ${DIFFICULTY_CHIP[d]}`}>
                      {tally[d] ?? 0} {d}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {matches.map((p) => (
                    <div key={p.slug} className="flex justify-between text-xs">
                      <span className="text-ink-soft">{p.display_name}</span>
                      <span className="text-ink-faint">
                        {p.difficulty} · {new Date(p.solved_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>

                {matches.length < count && (
                  <p className="text-[10px] text-ink-faint">
                    Showing {matches.length} of {count} solved — older solves outside
                    your tracked history aren&apos;t listed individually.
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-ink-faint">No problems tracked yet for this topic.</p>
            )}

            <Link
              href={`/dashboard/problems?topic=${encodeURIComponent(topic)}`}
              className="inline-block text-xs text-accent-400 hover:opacity-80"
            >
              View all in Problems &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopicsExplorer({
  topics,
  problems,
  totalSolved,
}: {
  topics: TopicEntry[];
  problems: Problem[];
  totalSolved: number;
}) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter(([topic]) => topic.toLowerCase().includes(query));
  }, [topics, search]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search topics..."
        className="mb-4 shrink-0 bg-surface border border-line rounded-lg px-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-accent-500"
      />

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {filtered.map(([topic, count]) => (
          <TopicRow
            key={topic}
            topic={topic}
            count={count}
            totalSolved={totalSolved}
            problems={problems}
            isOpen={expanded === topic}
            onToggle={() => setExpanded(expanded === topic ? null : topic)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-ink-faint text-sm">No topics match your search.</p>
        )}
      </div>
    </div>
  );
}
