import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncLeetCodeData } from '@/lib/leetcode/sync';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id }, { onConflict: 'id', ignoreDuplicates: true });

      if (upsertError) {
        console.error('profiles upsert failed:', upsertError);
      }

      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('leetcode_username')
        .eq('id', data.user.id)
        .single();

      if (selectError) {
        console.error('profiles select failed:', selectError);
      }

      if (!profile?.leetcode_username) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      try {
        await syncLeetCodeData(supabase, data.user.id, profile.leetcode_username);
      } catch (error) {
        console.error('LeetCode sync failed:', error);
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
