/**
 * Trip status values
 */
export type TripStatus = 'draft' | 'planned' | 'booked' | 'in_progress' | 'completed' | 'cancelled';

/**
 * A travel trip containing multiple items
 */
export interface Trip {
  id: string;
  name: string;
  description?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  destination: string;
  status: TripStatus;
  items?: TripItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Trip item types
 */
export type TripItemType = 'flight' | 'hotel' | 'activity' | 'transport' | 'restaurant' | 'other';

/**
 * Trip item status
 */
export type TripItemStatus = 'pending' | 'confirmed' | 'cancelled';

/**
 * Location information
 */
export interface Location {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

/**
 * Price information
 */
export interface Price {
  amount: number;
  currency: string;
}

/**
 * An item within a trip (flight, hotel, activity, etc.)
 */
export interface TripItem {
  id: string;
  tripId: string;
  type: TripItemType;
  title: string;
  description?: string | null;
  startDateTime: string; // ISO 8601
  endDateTime?: string | null;
  location?: Location | null;
  confirmationNumber?: string | null;
  price?: Price | null;
  status: TripItemStatus;
  offer?: OfferHotel | OfferFlight | null;
  citations?: Citation[];
  createdAt: string;
  updatedAt: string;
}

// Re-export offer types
import type { OfferHotel, OfferFlight } from './offer';
import type { Citation } from './citation';

export type { OfferHotel, OfferFlight, Citation };
