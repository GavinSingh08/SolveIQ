'use client';

import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISS_KEY = 'solveiq-disclaimer-dismissed';

export function TrackingDisclaimer() {
  const [stage, setStage] = useState<'hidden' | 'open' | 'minimized'>('hidden');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    setStage(dismissed ? 'minimized' : 'open');
  }, []);

  const close = () => {
    if (dontShowAgain) {
      localStorage.setItem(DISMISS_KEY, 'true');
    } else {
      localStorage.removeItem(DISMISS_KEY);
    }
    setStage('minimized');
  };

  return (
    <>
      <div
        className={`fixed bottom-4 right-4 z-50 w-80 origin-bottom-right bg-surface border border-line rounded-lg p-4 shadow-lg transition-all duration-300 ease-out ${
          stage === 'open'
            ? 'scale-100 opacity-100'
            : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-semibold">Heads up</p>
          <button onClick={close} aria-label="Close" className="text-ink-faint hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-ink-soft mb-3">
          We can only see your 20 most recent accepted submissions each sync.
          Problems you solved before connecting your account may not show up —
          but everything you solve from now on will be tracked.
        </p>
        <label className="flex items-center gap-2 text-xs text-ink-faint cursor-pointer">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            style={{ accentColor: 'var(--accent-500)' }}
          />
          Don&apos;t show this again
        </label>
      </div>

      <button
        onClick={() => setStage('open')}
        aria-label="Show tracking notice"
        className={`fixed bottom-4 right-4 z-50 w-10 h-10 origin-bottom-right rounded-full bg-surface border border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface-hover shadow-lg transition-all duration-300 ease-out ${
          stage === 'minimized'
            ? 'scale-100 opacity-100'
            : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <Info size={18} />
      </button>
    </>
  );
}
