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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">InterviewIQ</h1>
        <p className="text-lg text-gray-400 mb-8">
          The smartest way to prepare for your coding interviews.
        </p>
        <button
          onClick={handleSignIn}
          className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center w-full max-w-xs mx-auto"
        >
          Sign In with GitHub
        </button>
      </div>
    </div>
  );
}
