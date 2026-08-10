import { BrainCircuit } from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';
import { DashboardNav } from '@/components/dashboard-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-base text-ink">
      <aside className="w-60 shrink-0 border-r border-line flex flex-col">
        <div className="flex items-center gap-2 px-6 py-6 text-xl font-bold border-b border-line">
          <BrainCircuit size={22} className="text-accent-400" />
          SolveIQ
        </div>

        <DashboardNav />

        <div className="px-3 py-4 border-t border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-hover" />
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1">{children}</div>
    </div>
  );
}
