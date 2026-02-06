'use client';

import { useRouter } from 'next/navigation';
import type { TravelDocDecrypted } from '@travel/contracts';
import { DocumentViewer } from '@/app/_components/documents/DocumentViewer';

interface DocumentViewerWrapperProps {
  document: TravelDocDecrypted;
}

export function DocumentViewerWrapper({ document }: DocumentViewerWrapperProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete document');
      }

      router.push('/documents');
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <DocumentViewer
        document={document}
        onClose={() => router.push('/documents')}
        onDelete={handleDelete}
      />
    </div>
  );
}
