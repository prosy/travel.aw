import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { redirect } from 'next/navigation';
import { PointsAccountCard } from '@/app/_components/points/PointsAccountCard';
import type { PointsAccount } from '@travel/contracts';

export default async function PointsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const rawAccounts = await prisma.pointsAccount.findMany({
    where: { userId: user.id },
    orderBy: { programName: 'asc' },
  });

  const accounts: PointsAccount[] = rawAccounts.map((account: (typeof rawAccounts)[number]) => ({
    id: account.id,
    programType: account.programType as PointsAccount['programType'],
    programName: account.programName,
    membershipTier: account.membershipTier,
    currentBalance: account.currentBalance,
    pendingPoints: account.pendingPoints,
    expiringPoints: account.expiringPoints,
    expirationDate: account.expirationDate?.toISOString() ?? null,
    annualFee: account.annualFee,
    nextFeeDate: account.nextFeeDate?.toISOString() ?? null,
    notes: account.notes,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Points &amp; Loyalty Programs
        </h1>
        <Link
          href="/points/new"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add Program
        </Link>
      </div>

      {accounts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-zinc-500">
            No loyalty programs added yet. Add your first program to start
            tracking.
          </p>
          <Link
            href="/points/new"
            className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add Program
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {accounts.map((account) => (
            <li key={account.id}>
              <Link href={`/points/${account.id}`}>
                <PointsAccountCard account={account} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
