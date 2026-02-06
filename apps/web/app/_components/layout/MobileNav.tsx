'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/trips', label: 'Trips', icon: '\u2708\uFE0F' },
  { href: '/points', label: 'Points', icon: '\u2B50' },
  { href: '/friends', label: 'Friends', icon: '\u{1F465}' },
  { href: '/safety', label: 'Safety', icon: '\u{1F6E1}\uFE0F' },
  { href: '/documents', label: 'Documents', icon: '\u{1F4C4}' },
  { href: '/settings', label: 'Settings', icon: '\u2699\uFE0F' },
  { href: '/help', label: 'Help', icon: '\u2753' },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Open navigation menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Overlay + slide-out panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Panel */}
          <div className="relative z-10 flex w-64 flex-col bg-zinc-900 text-zinc-300 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5">
              <span className="text-lg font-bold text-white tracking-tight">
                travel.aw
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                aria-label="Close navigation menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 overflow-y-auto px-3 py-2">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(link.href + '/');
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                      >
                        <span className="w-5 text-center text-base" aria-hidden>
                          {link.icon}
                        </span>
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="border-t border-zinc-800 px-3 py-3">
              <a
                href="/auth/logout"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
              >
                <span className="w-5 text-center text-base" aria-hidden>
                  {'\u{1F6AA}'}
                </span>
                Log out
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
