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

    // Verify ticket ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        senderType: m.senderType,
        message: m.message,
        attachments: m.attachments ? JSON.parse(m.attachments) : null,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('GET /api/support/tickets/[id]/messages error:', error);
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

    // Verify ticket ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return NextResponse.json(
        { error: 'Cannot add messages to closed tickets' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Create message and update ticket
    const [message] = await prisma.$transaction([
      prisma.supportMessage.create({
        data: {
          ticketId: id,
          senderType: 'user',
          message: body.message,
          attachments: body.attachments ? JSON.stringify(body.attachments) : null,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: { status: 'open' }, // Reopen if was in_progress
      }),
    ]);

    return NextResponse.json(
      {
        id: message.id,
        senderType: message.senderType,
        message: message.message,
        attachments: message.attachments ? JSON.parse(message.attachments) : null,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/support/tickets/[id]/messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
