/**
 * Help center and support ticket types.
 */

export type TicketCategory =
  | 'account'
  | 'trips'
  | 'billing'
  | 'technical'
  | 'other';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type MessageSenderType = 'user' | 'support' | 'system';

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messageCount?: number;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
  resolvedAt: string | null;  // ISO 8601
}

export interface SupportTicketWithMessages extends SupportTicket {
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  senderType: MessageSenderType;
  message: string;
  attachments: string[] | null;
  createdAt: string;  // ISO 8601
}

export interface CreateSupportTicket {
  subject: string;
  category: TicketCategory;
  message: string;
  priority?: TicketPriority;
}

export interface CreateSupportMessage {
  message: string;
  attachments?: string[];
}

export interface FaqArticle {
  id: string;
  question: string;
  answer: string;
}

export interface FaqResponse {
  categories: string[];
  articles: Record<string, FaqArticle[]>;
}
