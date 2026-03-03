'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        {trigger}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-1 min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, i) =>
            item.href ? (
              <a
                key={i}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  item.variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                  item.variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
