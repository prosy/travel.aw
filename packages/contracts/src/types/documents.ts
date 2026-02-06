/**
 * Travel document types for secure document storage.
 */

export type TravelDocType =
  | 'passport'
  | 'visa'
  | 'drivers_license'
  | 'insurance'
  | 'vaccination'
  | 'other';

/**
 * Travel document metadata (non-sensitive, returned in list views).
 */
export interface TravelDoc {
  id: string;
  type: TravelDocType;
  title: string;
  countryCode: string | null;
  expirationDate: string | null;  // ISO 8601
  reminderDays: number;
  hasAttachment: boolean;
  attachmentType: string | null;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

/**
 * Travel document with decrypted sensitive data.
 * Only returned when specifically requesting a single document.
 */
export interface TravelDocDecrypted extends TravelDoc {
  documentNumber: string | null;
  issueDate: string | null;  // ISO 8601
  holderName: string | null;
  notes: string | null;
}

/**
 * Sensitive fields stored encrypted in the database.
 */
export interface TravelDocSensitiveData {
  documentNumber: string | null;
  issueDate: string | null;
  holderName: string | null;
  notes: string | null;
}

export interface CreateTravelDoc {
  type: TravelDocType;
  title: string;
  documentNumber?: string;
  issueDate?: string;
  holderName?: string;
  countryCode?: string;
  expirationDate?: string;
  reminderDays?: number;
  notes?: string;
  hasAttachment?: boolean;
  attachmentType?: string;
}
