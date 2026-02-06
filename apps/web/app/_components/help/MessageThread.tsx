'use client';

import { useState } from 'react';
import type { SupportMessage, MessageSenderType } from '@travel/contracts';

interface MessageThreadProps {
  messages: SupportMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isClosed?: boolean;
}

const senderConfig: Record<MessageSenderType, { label: string; bgColor: string; textColor: string; align: string }> = {
  user: {
    label: 'You',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    align: 'ml-auto',
  },
  support: {
    label: 'Support',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    textColor: 'text-gray-900 dark:text-white',
    align: 'mr-auto',
  },
  system: {
    label: 'System',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    align: 'mx-auto',
  },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}

interface MessageBubbleProps {
  message: SupportMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const config = senderConfig[message.senderType];

  return (
    <div className={`flex flex-col ${message.senderType === 'user' ? 'items-end' : 'items-start'} ${message.senderType === 'system' ? 'items-center' : ''}`}>
      {message.senderType !== 'user' && (
        <span className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {config.label}
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${config.bgColor} ${config.textColor} ${
          message.senderType === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
        } ${message.senderType === 'system' ? 'rounded-2xl text-center text-sm' : ''}`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-xs underline ${
                  message.senderType === 'user' ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachment {idx + 1}
              </a>
            ))}
          </div>
        )}
      </div>
      <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
}

export function MessageThread({ messages, onSendMessage, isLoading, isClosed }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isLoading) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Input */}
      {isClosed ? (
        <div className="border-t border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This ticket has been closed. Open a new ticket if you need further assistance.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !newMessage.trim()}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
