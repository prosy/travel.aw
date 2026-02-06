'use client';

import type { TravelDoc, TravelDocType } from '@travel/contracts';

interface DocumentCardProps {
  document: TravelDoc;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const typeConfig: Record<TravelDocType, { icon: string; label: string; color: string }> = {
  passport: {
    icon: '🛂',
    label: 'Passport',
    color: 'bg-blue-100 dark:bg-blue-900',
  },
  visa: {
    icon: '📋',
    label: 'Visa',
    color: 'bg-purple-100 dark:bg-purple-900',
  },
  drivers_license: {
    icon: '🪪',
    label: "Driver's License",
    color: 'bg-green-100 dark:bg-green-900',
  },
  insurance: {
    icon: '🏥',
    label: 'Insurance',
    color: 'bg-red-100 dark:bg-red-900',
  },
  vaccination: {
    icon: '💉',
    label: 'Vaccination',
    color: 'bg-yellow-100 dark:bg-yellow-900',
  },
  other: {
    icon: '📄',
    label: 'Other',
    color: 'bg-gray-100 dark:bg-gray-700',
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No expiration';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getExpirationStatus(expirationDate: string | null, reminderDays: number): 'expired' | 'expiring' | 'valid' | 'none' {
  if (!expirationDate) return 'none';

  const expDate = new Date(expirationDate);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= reminderDays) return 'expiring';
  return 'valid';
}

const expirationStatusConfig = {
  expired: {
    text: 'Expired',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    textColor: 'text-red-700 dark:text-red-300',
  },
  expiring: {
    text: 'Expiring Soon',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  valid: {
    text: '',
    bgColor: '',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
  none: {
    text: '',
    bgColor: '',
    textColor: 'text-gray-500 dark:text-gray-500',
  },
};

export function DocumentCard({ document, onClick, onEdit, onDelete }: DocumentCardProps) {
  const config = typeConfig[document.type];
  const expirationStatus = getExpirationStatus(document.expirationDate, document.reminderDays);
  const statusConfig = expirationStatusConfig[expirationStatus];

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${
        onClick ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
            <span className="text-xl">{config.icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{document.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{config.label}</p>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                aria-label="Edit document"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900 dark:hover:text-red-400"
                aria-label="Delete document"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {document.countryCode && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {document.countryCode}
            </span>
          )}
          {document.hasAttachment && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attachment
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {statusConfig.text && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.text}
            </span>
          )}
          <span className={`text-sm ${statusConfig.textColor}`}>
            {document.expirationDate ? `Exp: ${formatDate(document.expirationDate)}` : 'No expiration'}
          </span>
        </div>
      </div>
    </div>
  );
}
