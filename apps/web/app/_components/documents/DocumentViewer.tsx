'use client';

import type { TravelDocDecrypted, TravelDocType } from '@travel/contracts';

interface DocumentViewerProps {
  document: TravelDocDecrypted;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const typeLabels: Record<TravelDocType, string> = {
  passport: 'Passport',
  visa: 'Visa',
  drivers_license: "Driver's License",
  insurance: 'Insurance',
  vaccination: 'Vaccination Record',
  other: 'Document',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface FieldRowProps {
  label: string;
  value: string | null;
  isSensitive?: boolean;
}

function FieldRow({ label, value, isSensitive }: FieldRowProps) {
  if (!value) return null;

  return (
    <div className="flex justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-medium text-gray-900 dark:text-white ${isSensitive ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export function DocumentViewer({ document, onClose, onEdit, onDelete }: DocumentViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {document.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {typeLabels[document.type]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Encrypted document - data is protected
              </span>
            </div>
          </div>

          <div className="mt-6">
            <FieldRow label="Document Number" value={document.documentNumber} isSensitive />
            <FieldRow label="Holder Name" value={document.holderName} />
            <FieldRow label="Country" value={document.countryCode} />
            <FieldRow label="Issue Date" value={formatDate(document.issueDate)} />
            <FieldRow label="Expiration Date" value={formatDate(document.expirationDate)} />
            <FieldRow label="Reminder" value={document.reminderDays ? `${document.reminderDays} days before expiry` : null} />
          </div>

          {document.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{document.notes}</p>
            </div>
          )}

          {document.hasAttachment && (
            <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Attachment</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {document.attachmentType || 'File'}
                    </p>
                  </div>
                </div>
                <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  View
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {formatDate(document.updatedAt)}
          </div>
          <div className="flex gap-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
