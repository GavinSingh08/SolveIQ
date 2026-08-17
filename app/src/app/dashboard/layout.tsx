import { BrainCircuit } from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';
import { DashboardNav } from '@/components/dashboard-nav';
import { TrackingDisclaimer } from '@/components/tracking-disclaimer';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <div className="h-screen overflow-hidden flex bg-base text-ink">
      <aside className="w-60 shrink-0 border-r border-line flex flex-col">
        <div className="flex items-center gap-2 px-6 py-6 text-xl font-bold border-b border-line">
          <BrainCircuit size={22} className="text-accent-400" />
          SolveIQ
        </div>

        <DashboardNav />

        <div className="px-3 py-4 border-t border-line flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface-hover shrink-0" />
          )}
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 min-h-0">{children}</div>

      <TrackingDisclaimer />
    </div>
  );
}
