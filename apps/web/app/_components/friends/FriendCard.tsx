'use client';

import type { User } from '@travel/contracts';

type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

interface FriendCardProps {
  friend: User;
  status: FriendshipStatus;
  nickname?: string | null;
  onRemove?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
}

const statusConfig: Record<FriendshipStatus, { label: string; color: string }> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  accepted: {
    label: 'Friend',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  blocked: {
    label: 'Blocked',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export function FriendCard({ friend, status, nickname, onRemove, onBlock, onUnblock }: FriendCardProps) {
  const config = statusConfig[status];
  const displayName = nickname || friend.name || friend.email;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        {friend.picture ? (
          <img
            src={friend.picture}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <span className="text-lg font-medium">
              {(friend.name || friend.email).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white">{displayName}</h3>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
          {nickname && friend.name && (
            <p className="text-xs text-gray-400 dark:text-gray-500">({friend.name})</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === 'blocked' ? (
          onUnblock && (
            <button
              onClick={onUnblock}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Unblock
            </button>
          )
        ) : (
          <>
            {onBlock && (
              <button
                onClick={onBlock}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                Block
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Remove
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
