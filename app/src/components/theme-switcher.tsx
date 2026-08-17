'use client';

import { useLayoutEffect, useState } from 'react';
import { themes, THEME_STORAGE_KEY, type ThemeId } from '@/lib/themes';

export function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeId>('onyx');

  useLayoutEffect(() => {
    // Re-applies the inline script's choice after React Strict Mode's dev-only
    // remount clears attributes it doesn't own. No-op in production.
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    const theme = stored ?? 'onyx';
    document.documentElement.setAttribute('data-theme', theme);
    setActive(theme);
  }, []);

  const applyTheme = (id: ThemeId) => {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setActive(id);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => applyTheme(theme.id)}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
            active === theme.id
              ? 'border-accent-500 bg-surface'
              : 'border-line bg-surface/50 hover:bg-surface'
          }`}
        >
          <span
            className="w-4 h-4 rounded-full shrink-0 border border-line"
            style={{ backgroundColor: theme.swatch }}
          />
          {theme.label}
        </button>
      ))}
    </div>
  );
}
