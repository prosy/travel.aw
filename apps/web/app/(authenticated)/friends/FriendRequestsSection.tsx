'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FriendRequestCard } from '@/app/_components/friends/FriendRequestCard';
import type { User } from '@travel/contracts';

interface FriendRequest {
  friendshipId: string;
  from: User;
  requestedAt: string;
}

interface FriendRequestsSectionProps {
  requests: FriendRequest[];
}

export default function FriendRequestsSection({ requests }: FriendRequestsSectionProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAccept(friendshipId: string) {
    setLoadingId(friendshipId);
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to accept request');
      }

      router.refresh();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDecline(friendshipId: string) {
    setLoadingId(friendshipId);
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to decline request');
      }

      router.refresh();
    } catch (error) {
      console.error('Error declining friend request:', error);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <ul className="space-y-3">
      {requests.map((req) => (
        <li key={req.friendshipId}>
          <FriendRequestCard
            from={req.from}
            requestedAt={req.requestedAt}
            onAccept={() => handleAccept(req.friendshipId)}
            onDecline={() => handleDecline(req.friendshipId)}
            isLoading={loadingId === req.friendshipId}
          />
        </li>
      ))}
    </ul>
  );
}
