'use client';

import type { User } from '@travel/contracts';

interface FriendRequestCardProps {
  from: User;
  requestedAt: string;
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function FriendRequestCard({
  from,
  requestedAt,
  onAccept,
  onDecline,
  isLoading,
}: FriendRequestCardProps) {
  const displayName = from.name || from.email;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-4">
        {from.picture ? (
          <img
            src={from.picture}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <span className="text-lg font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{displayName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{from.email}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(requestedAt)}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            wants to connect with you
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <svg className="-ml-1 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Accept
                </>
              )}
            </button>
            <button
              onClick={onDecline}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
