'use client';

import type { PointsTransaction, PointsTransactionType } from '@travel/contracts';

interface TransactionListProps {
  transactions: PointsTransaction[];
  onTransactionClick?: (transaction: PointsTransaction) => void;
}

const typeConfig: Record<PointsTransactionType, { label: string; color: string; prefix: string }> = {
  earned: {
    label: 'Earned',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    prefix: '+',
  },
  redeemed: {
    label: 'Redeemed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    prefix: '-',
  },
  transferred: {
    label: 'Transferred',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    prefix: '',
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    prefix: '-',
  },
  adjustment: {
    label: 'Adjustment',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    prefix: '',
  },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.abs(num));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => {
            const config = typeConfig[transaction.type];
            const isPositive = transaction.amount > 0;

            return (
              <tr
                key={transaction.id}
                onClick={() => onTransactionClick?.(transaction)}
                className={onTransactionClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(transaction.transactionDate)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {transaction.description || '-'}
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? '+' : '-'}{formatNumber(transaction.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
