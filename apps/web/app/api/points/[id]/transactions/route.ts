import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify account ownership
    const account = await prisma.pointsAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transactions = await prisma.pointsTransaction.findMany({
      where: { accountId: id },
      orderBy: { transactionDate: 'desc' },
    });

    return NextResponse.json(
      transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        transactionDate: t.transactionDate.toISOString(),
        tripItemId: t.tripItemId,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/points/[id]/transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify account ownership
    const account = await prisma.pointsAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.type || body.amount === undefined || !body.transactionDate) {
      return NextResponse.json(
        { error: 'type, amount, and transactionDate are required' },
        { status: 400 }
      );
    }

    // Create transaction and update account balance
    const [transaction] = await prisma.$transaction([
      prisma.pointsTransaction.create({
        data: {
          accountId: id,
          type: body.type,
          amount: body.amount,
          description: body.description ?? null,
          transactionDate: new Date(body.transactionDate),
          tripItemId: body.tripItemId ?? null,
        },
      }),
      prisma.pointsAccount.update({
        where: { id },
        data: {
          currentBalance: {
            increment: body.type === 'earned' || body.type === 'adjustment'
              ? body.amount
              : body.type === 'redeemed' || body.type === 'expired' || body.type === 'transferred'
                ? -Math.abs(body.amount)
                : 0,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        transactionDate: transaction.transactionDate.toISOString(),
        tripItemId: transaction.tripItemId,
        createdAt: transaction.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/points/[id]/transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
