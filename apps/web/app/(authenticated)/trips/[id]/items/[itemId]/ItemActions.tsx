'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ItemActionsProps {
  tripId: string;
  itemId: string;
}

export function ItemActions({ tripId, itemId }: ItemActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push(`/trips/${tripId}`);
        router.refresh();
      } else {
        alert('Failed to delete item.');
        setDeleting(false);
      }
    } catch {
      alert('Failed to delete item.');
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={() => router.push(`/trips/${tripId}/edit`)}
        className="flex-1 rounded-lg border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        Edit Trip
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex-1 rounded-lg border border-red-500/30 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        {deleting ? 'Deleting...' : 'Delete Item'}
      </button>
    </div>
  );
}
