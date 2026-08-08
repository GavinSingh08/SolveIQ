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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center max-w-sm w-full px-6">
        <h1 className="text-3xl font-bold mb-2">
          Connect your LeetCode account
        </h1>
        <p className="text-gray-400 mb-8">
          We use your public LeetCode stats to build your analytics and
          recommendations.
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          <label
            htmlFor="leetcode-username"
            className="block text-sm text-gray-400 mb-2"
          >
            LeetCode Username
          </label>
          <input
            id="leetcode-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. johndoe123"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={status !== 'idle'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg mt-6"
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
