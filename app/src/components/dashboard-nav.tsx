'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  BookOpen,
  Target,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react';

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Problems', icon: ListChecks, href: '/dashboard/problems' },
  { label: 'Topics', icon: BookOpen, href: '/dashboard/topics' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Recommendations', icon: Target },
  { label: 'AI Coach', icon: Sparkles, badge: 'Soon' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ label, icon: Icon, href, badge }) => {
        const active = href ? pathname === href : false;
        const className = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
          active ? 'bg-surface text-ink' : 'text-ink-soft hover:bg-surface/50'
        } ${href ? '' : 'cursor-default'}`;

        const content = (
          <>
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] uppercase tracking-wide bg-surface-hover text-ink-soft px-1.5 py-0.5 rounded">
                {badge}
              </span>
            )}
          </>
        );

        if (href) {
          return (
            <Link key={label} href={href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <div key={label} className={className}>
            {content}
          </div>
        );
      })}
    </nav>
  );
}
