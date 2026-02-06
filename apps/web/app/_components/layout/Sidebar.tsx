'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarUser {
  name: string | null;
  picture: string | null;
  email: string;
}

interface SidebarProps {
  user?: SidebarUser;
}

const NAV_LINKS = [
  { href: '/trips', label: 'Trips', icon: '\u2708\uFE0F' },
  { href: '/points', label: 'Points', icon: '\u2B50' },
  { href: '/friends', label: 'Friends', icon: '\u{1F465}' },
  { href: '/safety', label: 'Safety', icon: '\u{1F6E1}\uFE0F' },
  { href: '/documents', label: 'Documents', icon: '\u{1F4C4}' },
  { href: '/settings', label: 'Settings', icon: '\u2699\uFE0F' },
  { href: '/help', label: 'Help', icon: '\u2753' },
] as const;

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col fixed left-0 top-0 w-56 h-screen bg-zinc-900 text-zinc-300 border-r border-zinc-800">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-lg font-bold text-white tracking-tight">travel.aw</span>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 px-5 pb-4 border-b border-zinc-800 mb-2">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name ?? user.email}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white shrink-0">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user.name ?? user.email}
            </p>
            {user.name && (
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
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
    </aside>
  );
}
