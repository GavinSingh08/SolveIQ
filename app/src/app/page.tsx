'use client';

import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base text-ink">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">SolveIQ</h1>
        <p className="text-lg text-ink-soft mb-8">
          Track your coding practice and get better, powered by AI.
        </p>
        <button
          onClick={handleSignIn}
          className="bg-surface hover:bg-surface-hover text-ink font-bold py-3 px-6 rounded-lg flex items-center justify-center w-full max-w-xs mx-auto"
        >
          Sign In with GitHub
        </button>
      </div>
    </div>
  );
}
