import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import type { TicketCategory, TicketPriority, TicketStatus } from '@travel/contracts';
import { TicketsClient } from './TicketsClient';

export default async function SupportTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/api/auth/login');

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  const ticketList = tickets.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category as TicketCategory,
    priority: ticket.priority as TicketPriority,
    status: ticket.status as TicketStatus,
    messageCount: ticket._count.messages,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/help"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Help Center
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
      </div>

      <TicketsClient initialTickets={ticketList} />
    </div>
  );
}
