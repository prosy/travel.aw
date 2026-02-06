import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/app/_lib/auth';
import { prisma } from '@/app/_lib/prisma';
import { formatDate } from '@/app/_lib/format';
import { TicketDetailClient } from './TicketDetailClient';

function statusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'in_progress':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    case 'resolved':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'closed':
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 dark:text-red-400';
    case 'high':
      return 'text-amber-600 dark:text-amber-400';
    case 'normal':
      return 'text-zinc-600 dark:text-zinc-400';
    case 'low':
      return 'text-zinc-400 dark:text-zinc-500';
    default:
      return 'text-zinc-600 dark:text-zinc-400';
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/api/auth/login');

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!ticket || ticket.userId !== user.id) {
    notFound();
  }

  const messages = ticket.messages.map((m) => ({
    id: m.id,
    senderType: m.senderType as 'user' | 'support' | 'system',
    message: m.message,
    attachments: m.attachments ? (JSON.parse(m.attachments) as string[]) : null,
    createdAt: m.createdAt.toISOString(),
  }));

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/help/tickets"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &larr; Back to Tickets
        </Link>
      </div>

      {/* Ticket metadata */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-zinc-500">
                Category: <span className="font-medium text-zinc-700 dark:text-zinc-300">{ticket.category}</span>
              </span>
              <span className={`font-medium ${priorityColor(ticket.priority)}`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} priority
              </span>
              <span className="text-zinc-400">
                Opened {formatDate(ticket.createdAt.toISOString())}
              </span>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${statusColor(ticket.status)}`}
          >
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
        {ticket.resolvedAt && (
          <p className="mt-2 text-xs text-zinc-400">
            Resolved {formatDate(ticket.resolvedAt.toISOString())}
          </p>
        )}
      </div>

      {/* Message thread */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" style={{ minHeight: '400px' }}>
        <TicketDetailClient
          ticketId={ticket.id}
          initialMessages={messages}
          isClosed={isClosed}
        />
      </div>
    </div>
  );
}
