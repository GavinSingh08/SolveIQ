'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Onboarding() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'syncing'>(
    'idle'
  );
  const router = useRouter();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setStatus('verifying');

    const verifyResponse = await fetch('/api/leetcode/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const { exists } = await verifyResponse.json();

    if (!exists) {
      setError('LeetCode username not found. Please check and try again.');
      setStatus('idle');
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be signed in to continue.');
      setStatus('idle');
      return;
    }

    await supabase
      .from('profiles')
      .upsert({ id: user.id, leetcode_username: username });

    setStatus('syncing');
    await fetch('/api/leetcode/sync', { method: 'POST' });

    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base text-ink">
      <div className="text-center max-w-sm w-full px-6">
        <h1 className="text-3xl font-bold mb-2">
          Connect your LeetCode account
        </h1>
        <p className="text-ink-soft mb-8">
          We use your public LeetCode stats to build your analytics and
          recommendations.
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          <label
            htmlFor="leetcode-username"
            className="block text-sm text-ink-soft mb-2"
          >
            LeetCode Username
          </label>
          <input
            id="leetcode-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. johndoe123"
            className="w-full bg-surface border border-line rounded-lg px-4 py-2 text-ink placeholder-ink-faint focus:outline-none focus:border-accent-500"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={status !== 'idle'}
            className="w-full bg-accent-600 hover:bg-accent-700 disabled:bg-accent-800 disabled:cursor-not-allowed text-ink font-bold py-3 rounded-lg mt-6"
          >
            {status === 'idle' && 'Continue'}
            {status === 'verifying' && 'Verifying...'}
            {status === 'syncing' && 'Syncing your solved problems...'}
          </button>
        </form>
      </div>
    </div>
  );
}
