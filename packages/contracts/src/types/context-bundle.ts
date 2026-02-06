/**
 * Context bundle purpose
 */
export type ContextPurpose = 'search' | 'recommendation' | 'planning' | 'booking' | 'summary';

/**
 * Budget constraints
 */
export interface BudgetConstraint {
  min?: number | null;
  max?: number | null;
  currency: string;
}

/**
 * Date constraints
 */
export interface DateConstraint {
  flexible: boolean;
  earliest?: string | null; // YYYY-MM-DD
  latest?: string | null; // YYYY-MM-DD
}

/**
 * Traveler counts
 */
export interface TravelerConstraint {
  adults: number;
  children: number;
  infants: number;
}

/**
 * All constraints for a context bundle
 */
export interface ContextConstraints {
  budget?: BudgetConstraint | null;
  dates?: DateConstraint | null;
  travelers?: TravelerConstraint | null;
  preferences?: string[];
}

/**
 * Conversation context item
 */
export interface ConversationItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * A bundle of contextual information for AI/agent processing
 */
export interface ContextBundle {
  id: string;
  tripId?: string | null;
  purpose: ContextPurpose;
  userIntent?: string | null;
  constraints?: ContextConstraints | null;
  priorContext?: ConversationItem[];
  relatedItems?: string[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
