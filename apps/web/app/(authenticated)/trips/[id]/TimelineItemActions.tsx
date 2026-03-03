'use client';

import { useRouter } from 'next/navigation';
import { Dropdown } from '@/app/_components/Dropdown';

interface TimelineItemActionsProps {
  tripId: string;
  itemId: string;
}

export function TimelineItemActions({ tripId, itemId }: TimelineItemActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const res = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to delete item.');
    }
  }

  return (
    <Dropdown
      trigger={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </svg>
      }
      items={[
        { label: 'View Details', href: `/trips/${tripId}/items/${itemId}` },
        { label: 'Edit Trip', href: `/trips/${tripId}/edit` },
        { label: 'Delete Item', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  );
}
