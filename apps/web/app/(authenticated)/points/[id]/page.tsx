'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PointsAccountCard } from '@/app/_components/points/PointsAccountCard';
import { TransactionList } from '@/app/_components/points/TransactionList';
import type { PointsAccount, PointsTransaction, PointsTransactionType } from '@travel/contracts';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PointsProgramDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [account, setAccount] = useState<PointsAccount | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBalance, setEditBalance] = useState(0);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<PointsTransactionType>('earned');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/points/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/points');
            return;
          }
          throw new Error('Failed to load');
        }
        const data = await res.json();
        // API returns account data at root level with transactions nested
        const { transactions: txns, ...accountData } = data;
        setAccount(accountData);
        setTransactions(txns || []);
        setEditBalance(accountData.currentBalance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params, router]);

  async function handleUpdateBalance() {
    if (!account) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/points/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBalance: editBalance }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setAccount(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!account) return;
    if (!confirm(`Delete ${account.programName}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/points/${account.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/points');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddTransaction() {
    if (!account || !transactionAmount) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/points/${account.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transactionType,
          amount: parseInt(transactionAmount, 10),
          description: transactionDesc || undefined,
          transactionDate: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to add transaction');

      // Reload data
      const accountRes = await fetch(`/api/points/${account.id}`);
      const reloadData = await accountRes.json();
      const { transactions: reloadTxns, ...reloadAccount } = reloadData;
      setAccount(reloadAccount);
      setTransactions(reloadTxns || []);
      setEditBalance(reloadAccount.currentBalance);

      // Reset form
      setShowAddTransaction(false);
      setTransactionAmount('');
      setTransactionDesc('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-red-500">{error || 'Account not found'}</p>
        <Link href="/points" className="text-blue-500 hover:underline">Back to Points</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/points"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Back to Points
        </Link>
        <button
          onClick={handleDelete}
          disabled={actionLoading}
          className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          Delete Program
        </button>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {account.programName}
      </h1>

      <div className="mb-8">
        <PointsAccountCard account={account} />

        {/* Quick Balance Edit */}
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Current Balance
            </span>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(parseInt(e.target.value, 10) || 0)}
                  className="w-32 rounded border border-zinc-300 px-2 py-1 text-right text-sm dark:border-zinc-600 dark:bg-zinc-800"
                />
                <button
                  onClick={handleUpdateBalance}
                  disabled={actionLoading}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditBalance(account.currentBalance); }}
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Edit Balance
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Transaction History
        </h2>
        <button
          onClick={() => setShowAddTransaction(!showAddTransaction)}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {showAddTransaction ? 'Cancel' : '+ Add Transaction'}
        </button>
      </div>

      {/* Add Transaction Form */}
      {showAddTransaction && (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as PointsTransactionType)}
                className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                <option value="earned">Earned</option>
                <option value="redeemed">Redeemed</option>
                <option value="transferred">Transferred</option>
                <option value="expired">Expired</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Amount</label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="1000"
                className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
              <input
                type="text"
                value={transactionDesc}
                onChange={(e) => setTransactionDesc(e.target.value)}
                placeholder="Flight booking"
                className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAddTransaction}
              disabled={!transactionAmount || actionLoading}
              className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </div>
      )}

      <TransactionList transactions={transactions} />
    </div>
  );
}
