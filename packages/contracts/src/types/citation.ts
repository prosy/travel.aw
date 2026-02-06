/**
 * Citation source types
 */
export type CitationType = 'email' | 'website' | 'api' | 'manual' | 'agent';

/**
 * Source citation for trip data provenance
 */
export interface Citation {
  id: string;
  type: CitationType;
  source: string;
  title?: string | null;
  url?: string | null;
  excerpt?: string | null;
  confidence?: number | null; // 0-1
  extractedAt: string; // ISO 8601
  extractedBy?: string | null;
  metadata?: Record<string, unknown> | null;
}
