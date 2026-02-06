import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { DocumentCardList } from './DocumentCardList';

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/api/auth/login');

  const documents = await prisma.travelDoc.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const docs = documents.map((doc) => ({
    id: doc.id,
    type: doc.type as 'passport' | 'visa' | 'drivers_license' | 'insurance' | 'vaccination' | 'other',
    title: doc.title,
    countryCode: doc.countryCode,
    expirationDate: doc.expirationDate?.toISOString() ?? null,
    reminderDays: doc.reminderDays,
    hasAttachment: doc.hasAttachment,
    attachmentType: doc.attachmentType,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Travel Documents</h1>
        <Link
          href="/documents/new"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Upload Document
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-zinc-500">
            No documents uploaded yet. Store your passports, visas, and insurance
            documents securely.
          </p>
          <Link
            href="/documents/new"
            className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Upload Document
          </Link>
        </div>
      ) : (
        <DocumentCardList documents={docs} />
      )}
    </div>
  );
}
