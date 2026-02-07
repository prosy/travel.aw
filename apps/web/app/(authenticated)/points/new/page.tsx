'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AddAccountForm } from '@/app/_components/points/AddAccountForm';
import { ImportModal } from '@/app/_components/points/ImportModal';
import type { CreatePointsAccount } from '@travel/contracts';
import type { ParsedProgram } from '@/app/_components/points/ImportReviewTable';

export default function NewPointsProgramPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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

  async function handleImport(programs: ParsedProgram[]) {
    const res = await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programs }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import programs');
    }

    router.push('/points');
    router.refresh();
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

      {/* Import Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowImportModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-sm font-medium text-zinc-600 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Import from Screenshot or Text
        </button>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Upload a screenshot of your loyalty programs or paste a list — AI will extract the details
        </p>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-zinc-950">or add manually</span>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <AddAccountForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/points')}
          isLoading={isLoading}
        />
      </div>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}
