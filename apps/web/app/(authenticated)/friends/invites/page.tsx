'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InviteForm } from '@/app/_components/friends/InviteForm';

export default function InviteFriendPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(email: string) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send invite');
      }

      router.push('/friends');
      router.refresh();
    } catch (error) {
      console.error('Error sending invite:', error);
      alert(error instanceof Error ? error.message : 'Failed to send invite');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Invite a Friend
        </h1>
        <Link
          href="/friends"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Back to Friends
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <InviteForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
