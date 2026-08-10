'use client';

import { useMemo, useState } from 'react';

type Problem = {
  slug: string;
  display_name: string;
  difficulty: string;
  topics: string[];
  solved_at: string;
};

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export function ProblemsExplorer({ problems }: { problems: Problem[] }) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');

  const topics = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => p.topics.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set).sort()];
  }, [problems]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return problems.filter((p) => {
      if (query && !p.display_name.toLowerCase().includes(query)) return false;
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      if (topic !== 'All' && !p.topics.includes(topic)) return false;
      return true;
    });
  }, [problems, search, difficulty, topic]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by problem name..."
          className="flex-1 min-w-[200px] bg-surface border border-line rounded-lg px-4 py-2 text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-accent-500"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent-500"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent-500"
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <p className="text-ink-faint text-xs mb-3">
        {filtered.length} of {problems.length} problems
      </p>

      <div className="space-y-2">
        {filtered.map((problem) => (
          <div
            key={problem.slug}
            className="bg-surface rounded-lg p-3 border border-line"
          >
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">{problem.display_name}</p>
              <span className="text-xs text-ink-soft">{problem.difficulty}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-ink-faint">{problem.topics.join(', ')}</p>
              <p className="text-xs text-ink-faint">
                {new Date(problem.solved_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-ink-faint text-sm">No problems match your filters.</p>
        )}
      </div>
    </div>
  );
}
