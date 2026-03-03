'use client';

import { useRouter } from 'next/navigation';
import { Dropdown } from '@/app/_components/Dropdown';

interface TripMoreOptionsProps {
  tripId: string;
}

export function TripMoreOptions({ tripId }: TripMoreOptionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this entire trip and all its items? This cannot be undone.')) return;
    const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/trips');
      router.refresh();
    } else {
      alert('Failed to delete trip.');
    }
  }

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
          </svg>
          <span>More</span>
        </div>
      }
      items={[
        { label: 'Edit Trip Info', href: `/trips/${tripId}/edit` },
        { label: 'Share Trip', href: `/trips/${tripId}/share` },
        { label: 'Export to Calendar', onClick: () => alert('Calendar export coming soon.') },
        { label: 'Delete Trip', onClick: handleDelete, variant: 'danger' },
      ]}
    />
  );
}
