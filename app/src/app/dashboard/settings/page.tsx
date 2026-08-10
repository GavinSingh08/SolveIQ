import { ThemeSwitcher } from '@/components/theme-switcher';

export default function SettingsPage() {
  return (
    <main className="h-screen px-8 py-6 max-w-3xl mx-auto overflow-y-auto">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-ink-soft text-sm mb-6">
        Customize how SolveIQ looks and feels.
      </p>

      <section>
        <h2 className="text-sm font-semibold mb-3">Color Theme</h2>
        <ThemeSwitcher />
      </section>
    </main>
  );
}
