import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: authUser.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(
      tickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        messageCount: ticket._count.messages,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
      }))
    );
  } catch (error) {
    console.error('GET /api/support/tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.subject || !body.category || !body.message) {
      return NextResponse.json(
        { error: 'subject, category, and message are required' },
        { status: 400 }
      );
    }

    // Create ticket with initial message
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: authUser.id,
        subject: body.subject,
        category: body.category,
        priority: body.priority ?? 'normal',
        messages: {
          create: {
            senderType: 'user',
            message: body.message,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json(
      {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        messages: ticket.messages.map((m) => ({
          id: m.id,
          senderType: m.senderType,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        })),
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/support/tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
