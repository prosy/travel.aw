'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface TopNavUser {
  name: string | null;
  picture: string | null;
  email: string;
}

interface TopNavProps {
  user?: TopNavUser;
  children?: React.ReactNode;
}

export function TopNav({ user, children }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between">
      {/* Page title slot */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Right side: user menu or sign-in */}
      {user ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="text-zinc-700 dark:text-zinc-300 hidden sm:inline truncate max-w-[140px]">
              {user.name ?? user.email}
            </span>
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name ?? user.email}
                className="h-7 w-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-white shrink-0">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-lg z-50">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Settings
              </Link>
              <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
              <a
                href="/auth/logout"
                className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Log out
              </a>
            </div>
          )}
        </div>
      ) : (
        <a
          href="/auth/login"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Sign in
        </a>
      )}
    </header>
  );
}
