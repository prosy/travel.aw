import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { PointsAccountCard } from '@/app/_components/points/PointsAccountCard';
import { TransactionList } from '@/app/_components/points/TransactionList';
import type { PointsAccount, PointsTransaction } from '@travel/contracts';

export default async function PointsProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const { id } = await params;

  const rawAccount = await prisma.pointsAccount.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { transactionDate: 'desc' },
        take: 50,
      },
    },
  });

  if (!rawAccount || rawAccount.userId !== user.id) {
    notFound();
  }

  const account: PointsAccount = {
    id: rawAccount.id,
    programType: rawAccount.programType as PointsAccount['programType'],
    programName: rawAccount.programName,
    membershipTier: rawAccount.membershipTier,
    currentBalance: rawAccount.currentBalance,
    pendingPoints: rawAccount.pendingPoints,
    expiringPoints: rawAccount.expiringPoints,
    expirationDate: rawAccount.expirationDate?.toISOString() ?? null,
    annualFee: rawAccount.annualFee,
    nextFeeDate: rawAccount.nextFeeDate?.toISOString() ?? null,
    notes: rawAccount.notes,
    createdAt: rawAccount.createdAt.toISOString(),
    updatedAt: rawAccount.updatedAt.toISOString(),
  };

  const transactions: PointsTransaction[] = rawAccount.transactions.map((t: (typeof rawAccount.transactions)[number]) => ({
    id: t.id,
    type: t.type as PointsTransaction['type'],
    amount: t.amount,
    description: t.description,
    transactionDate: t.transactionDate.toISOString(),
    tripItemId: t.tripItemId,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/points"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Back to Points
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {account.programName}
      </h1>

      <div className="mb-8">
        <PointsAccountCard account={account} />
      </div>

      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        Transaction History
      </h2>
      <TransactionList transactions={transactions} />
    </div>
  );
}
