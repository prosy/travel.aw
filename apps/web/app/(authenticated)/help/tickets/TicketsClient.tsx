'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SupportTicket, CreateSupportTicket } from '@travel/contracts';
import { TicketForm } from '@/app/_components/help/TicketForm';

interface TicketsClientProps {
  initialTickets: SupportTicket[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

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

function priorityLabel(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Low';
    default:
      return priority;
  }
}

export function TicketsClient({ initialTickets }: TicketsClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: CreateSupportTicket) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create ticket');
      }

      setShowForm(false);
      router.refresh();
    } catch (err) {
      console.error('Create ticket error:', err);
      alert(err instanceof Error ? err.message : 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold">Create a Support Ticket</h2>
          <TicketForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {initialTickets.length === 0 && !showForm ? (
        <div className="py-12 text-center">
          <p className="mb-6 text-zinc-500">
            No support tickets. Need help? Create a new ticket.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {initialTickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/help/tickets/${ticket.id}`}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{ticket.subject}</p>
                  <p className="text-sm text-zinc-500 truncate">
                    {ticket.category} &middot; {priorityLabel(ticket.priority)} priority
                  </p>
                  <p className="text-xs text-zinc-400">
                    Created {formatDate(ticket.createdAt)}
                    {ticket.messageCount ? ` \u00B7 ${ticket.messageCount} messages` : ''}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${statusColor(ticket.status)}`}
                >
                  {ticket.status.replace('_', ' ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
