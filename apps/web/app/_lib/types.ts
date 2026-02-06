/**
 * TODO: Replace these local stubs with imports from @travel/contracts
 * after Session 1 (codex-contracts-db) is merged.
 */

export type TripStatus = 'draft' | 'planned' | 'booked' | 'in_progress' | 'completed' | 'cancelled';
export type TripItemType = 'flight' | 'hotel' | 'activity' | 'transport' | 'restaurant' | 'other';
export type TripItemStatus = 'pending' | 'confirmed' | 'cancelled';
export type FlightClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface Price {
  amount: number;
  currency: string;
}

export interface Location {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface FlightLocation {
  airport: string;
  city?: string | null;
  dateTime: string;
  terminal?: string | null;
}

export interface Trip {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  destination: string;
  status: TripStatus;
  items?: TripItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TripItem {
  id: string;
  tripId: string;
  type: TripItemType;
  title: string;
  description?: string | null;
  startDateTime: string;
  endDateTime?: string | null;
  location?: Location | null;
  confirmationNumber?: string | null;
  price?: Price | null;
  status: TripItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OfferHotel {
  type: 'hotel';
  hotelName: string;
  hotelChain?: string | null;
  starRating?: number | null;
  roomType?: string | null;
  checkIn: string;
  checkOut: string;
  address?: string | null;
  amenities?: string[];
  pricePerNight?: Price | null;
  totalPrice?: Price | null;
  cancellationPolicy?: string | null;
  sourceUrl?: string | null;
  sourceProvider?: string | null;
}

export interface OfferFlight {
  type: 'flight';
  airline: string;
  flightNumber: string;
  departure: FlightLocation;
  arrival: FlightLocation;
  class?: FlightClass;
  duration?: string | null;
  stops: number;
  price?: Price | null;
  sourceUrl?: string | null;
  sourceProvider?: string | null;
}
