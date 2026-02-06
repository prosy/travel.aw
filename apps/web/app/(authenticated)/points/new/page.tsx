'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AddAccountForm } from '@/app/_components/points/AddAccountForm';
import type { CreatePointsAccount } from '@travel/contracts';

export default function NewPointsProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: CreatePointsAccount) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create account');
      }

      router.push('/points');
      router.refresh();
    } catch (error) {
      console.error('Error creating points account:', error);
      alert(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Add Loyalty Program
        </h1>
        <Link
          href="/points"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <AddAccountForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/points')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
