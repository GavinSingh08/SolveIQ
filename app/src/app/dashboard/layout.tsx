import {
  BrainCircuit,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Target,
  Sparkles,
  Settings,
} from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Topics', icon: BookOpen },
  { label: 'Recommendations', icon: Target },
  { label: 'AI Coach', icon: Sparkles, badge: 'Soon' },
  { label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      <aside className="w-60 shrink-0 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-6 py-6 text-xl font-bold border-b border-gray-800">
          <BrainCircuit size={22} className="text-blue-400" />
          InterviewIQ
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, icon: Icon, active, badge }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-default ${
                active
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] uppercase tracking-wide bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                  {badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700" />
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1">{children}</div>
    </div>
  );
}
