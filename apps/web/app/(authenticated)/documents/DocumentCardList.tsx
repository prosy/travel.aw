'use client';

import { useRouter } from 'next/navigation';
import type { TravelDoc } from '@travel/contracts';
import { DocumentCard } from '@/app/_components/documents/DocumentCard';

interface DocumentCardListProps {
  documents: TravelDoc[];
}

export function DocumentCardList({ documents }: DocumentCardListProps) {
  const router = useRouter();

  return (
    <ul className="space-y-3">
      {documents.map((doc) => (
        <li key={doc.id}>
          <DocumentCard
            document={doc}
            onClick={() => router.push(`/documents/${doc.id}`)}
          />
        </li>
      ))}
    </ul>
  );
}
