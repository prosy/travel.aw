'use client';

import { buildSearchLinks } from '@travel/adapters';
import type { ActionLink } from '@travel/adapters';

const PROVIDER_COLORS: Record<ActionLink['provider'], string> = {
  google: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  reddit: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
  wikipedia: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
  expedia: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
};

interface QuickSearchChipsProps {
  query: string;
}

export function QuickSearchChips({ query }: QuickSearchChipsProps) {
  const links = buildSearchLinks(query);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.provider}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${PROVIDER_COLORS[link.provider]}`}
        >
          {link.label}
          <svg
            className="ml-1 h-3 w-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      ))}
    </div>
  );
}
