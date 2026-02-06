/**
 * User types for authentication and profile management.
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  emailVerified: boolean;
  createdAt: string;  // ISO 8601
  lastLoginAt: string | null;  // ISO 8601
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tripReminders: boolean;
  priceAlerts: boolean;
  timezone: string;
  dateFormat: string;
  currency: string;
  connectedApps: ConnectedApp[];
}

export interface ConnectedApp {
  provider: string;
  connectedAt: string;  // ISO 8601
  scopes: string[];
}

export interface UserWithStats extends User {
  settings: UserSettings | null;
  stats: UserStats;
}

export interface UserStats {
  trips: number;
  pointsAccounts: number;
  friends: number;
}
