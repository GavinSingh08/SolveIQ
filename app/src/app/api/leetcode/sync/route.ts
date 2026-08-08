import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncLeetCodeData } from '@/lib/leetcode/sync';

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('leetcode_username')
    .eq('id', user.id)
    .single();

  if (!profile?.leetcode_username) {
    return NextResponse.json(
      { error: 'No LeetCode username saved for this account' },
      { status: 400 }
    );
  }

  try {
    await syncLeetCodeData(supabase, user.id, profile.leetcode_username);
  } catch (error) {
    console.error('LeetCode sync failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
