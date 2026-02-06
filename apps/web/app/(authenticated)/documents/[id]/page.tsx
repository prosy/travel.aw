import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { decryptJson, isEncryptionConfigured } from '@/app/_lib/encryption';
import { DocumentViewerWrapper } from './DocumentViewerWrapper';

interface SensitiveDocData {
  documentNumber: string | null;
  issueDate: string | null;
  holderName: string | null;
  notes: string | null;
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/api/auth/login');

  const { id } = await params;

  const doc = await prisma.travelDoc.findUnique({
    where: { id },
  });

  if (!doc || doc.userId !== user.id) {
    notFound();
  }

  // Decrypt sensitive data
  let sensitiveData: SensitiveDocData = {
    documentNumber: null,
    issueDate: null,
    holderName: null,
    notes: null,
  };

  if (isEncryptionConfigured()) {
    try {
      sensitiveData = decryptJson<SensitiveDocData>(
        doc.encryptedData,
        doc.encryptionIV
      );
    } catch (err) {
      console.error('Failed to decrypt document data:', err);
    }
  }

  const document = {
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
    documentNumber: sensitiveData.documentNumber,
    issueDate: sensitiveData.issueDate,
    holderName: sensitiveData.holderName,
    notes: sensitiveData.notes,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/documents"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Back to Documents
        </Link>
      </div>

      <DocumentViewerWrapper document={document} />
    </div>
  );
}
