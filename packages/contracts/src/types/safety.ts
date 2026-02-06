/**
 * Safety-related types: emergency contacts, advisories, alerts.
 */

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
  notifyOnTripStart: boolean;
  notifyOnDelay: boolean;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

export interface CreateEmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
  notifyOnTripStart?: boolean;
  notifyOnDelay?: boolean;
}

export type AdvisoryLevel = 1 | 2 | 3 | 4;

export interface TravelAdvisory {
  id: string;
  countryCode: string;
  countryName: string;
  advisoryLevel: AdvisoryLevel;
  advisoryText: string;
  lastUpdated: string;  // ISO 8601
  source: string;
  sourceUrl: string | null;
  healthRisks: string[] | null;
  securityRisks: string[] | null;
  entryRequirements: Record<string, unknown> | null;
}

export type AlertSeverity = 'info' | 'warning' | 'urgent';

export type AlertType =
  | 'advisory_change'
  | 'weather'
  | 'flight_status'
  | 'trip_reminder'
  | 'document_expiry'
  | 'system';

export interface UserAlert {
  id: string;
  tripId: string | null;
  advisoryId: string | null;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;  // ISO 8601
  createdAt: string;  // ISO 8601
}
