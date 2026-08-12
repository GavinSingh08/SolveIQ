'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export function InfoTooltip({ text }: { text: string }) {
  const [active, setActive] = useState<{ x: number; y: number } | null>(null);

  const show = (e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActive({ x: rect.left + rect.width / 2, y: rect.top });
  };
  const hide = () => setActive(null);

  return (
    <>
      <button
        type="button"
        onMouseEnter={show}
        onFocus={show}
        onMouseLeave={hide}
        onBlur={hide}
        className="text-ink-faint hover:text-ink-soft focus:text-ink-soft focus:outline-none"
        aria-label={text}
      >
        <Info size={13} />
      </button>

      {active &&
        createPortal(
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full w-[200px] bg-surface border border-line rounded px-2 py-1.5 text-[10px] text-ink-soft shadow-lg pointer-events-none"
            style={{ left: active.x, top: active.y - 6 }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
