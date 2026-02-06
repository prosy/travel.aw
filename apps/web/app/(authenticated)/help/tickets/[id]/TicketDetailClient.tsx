'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportMessage } from '@travel/contracts';
import { MessageThread } from '@/app/_components/help/MessageThread';

interface TicketDetailClientProps {
  ticketId: string;
  initialMessages: SupportMessage[];
  isClosed: boolean;
}

export function TicketDetailClient({
  ticketId,
  initialMessages,
  isClosed,
}: TicketDetailClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<SupportMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendMessage(text: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send message');
      }

      const newMessage: SupportMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      router.refresh();
    } catch (err) {
      console.error('Send message error:', err);
      alert(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MessageThread
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      isClosed={isClosed}
    />
  );
}
