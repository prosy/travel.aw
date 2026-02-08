'use client';

import { useRouter } from 'next/navigation';
import type { PointsAccount } from '@travel/contracts';

interface PointsAccountCardProps {
  account: PointsAccount;
  onEdit?: () => void;
  onDelete?: () => void;
  editHref?: string;
}

const programTypeIcons: Record<string, string> = {
  airline: 'plane',
  hotel: 'building',
  credit_card: 'credit-card',
  other: 'coins',
};

const tierColors: Record<string, string> = {
  Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Platinum: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  Diamond: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
}

export function PointsAccountCard({ account, onEdit, onDelete, editHref }: PointsAccountCardProps) {
  const router = useRouter();
  const tierColorClass = account.membershipTier
    ? tierColors[account.membershipTier] || tierColors.default
    : tierColors.default;

  const isExpiringSoon = account.expirationDate
    ? new Date(account.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <span className="text-lg">
              {account.programType === 'airline' && '✈️'}
              {account.programType === 'hotel' && '🏨'}
              {account.programType === 'credit_card' && '💳'}
              {account.programType === 'other' && '🎁'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {account.programName}
            </h3>
            {account.accountNumber && (
              <p className="font-mono text-sm text-gray-600 dark:text-gray-300">
                {account.accountNumber}
              </p>
            )}
            {account.membershipTier && (
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tierColorClass}`}>
                {account.membershipTier}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {editHref && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(editHref);
              }}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Edit account"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onEdit && !editHref && (
            <button
              onClick={onEdit}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              aria-label="Edit account"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900 dark:hover:text-red-400"
              aria-label="Delete account"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(account.currentBalance)}
          </p>
        </div>
        {account.pendingPoints > 0 && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
              +{formatNumber(account.pendingPoints)}
            </p>
          </div>
        )}
      </div>

      {(account.expiringPoints || account.expirationDate) && (
        <div className={`mt-4 rounded-lg p-3 ${isExpiringSoon ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="flex items-center gap-2">
            <svg className={`h-4 w-4 ${isExpiringSoon ? 'text-red-500' : 'text-yellow-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className={`text-sm font-medium ${isExpiringSoon ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
              {account.expiringPoints && `${formatNumber(account.expiringPoints)} points expiring`}
              {account.expiringPoints && account.expirationDate && ' on '}
              {account.expirationDate && formatDate(account.expirationDate)}
            </span>
          </div>
        </div>
      )}

      {account.annualFee && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Annual Fee</span>
            <span className="font-medium text-gray-900 dark:text-white">${account.annualFee}</span>
          </div>
          {account.nextFeeDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Next Fee Date</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(account.nextFeeDate)}</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
