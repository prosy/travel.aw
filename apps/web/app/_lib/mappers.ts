import type {
  Trip,
  TripItem,
  TripStatus,
  TripItemType,
  TripItemStatus,
  Location,
  Price,
  Citation,
  Media,
  MediaType,
  MediaSource,
  MediaAttribution,
  User,
  UserSettings,
  PointsAccount,
  PointsTransaction,
  PointsProgramType,
  PointsTransactionType,
  EmergencyContact,
  UserAlert,
  AlertType,
  AlertSeverity,
  SupportTicket,
  SupportMessage,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  MessageSenderType,
} from '@travel/contracts';
import type {
  Trip as PrismaTrip,
  TripItem as PrismaTripItem,
  CachedMedia as PrismaCachedMedia,
  User as PrismaUser,
  UserSettings as PrismaUserSettings,
  PointsAccount as PrismaPointsAccount,
  PointsTransaction as PrismaPointsTransaction,
  EmergencyContact as PrismaEmergencyContact,
  UserAlert as PrismaUserAlert,
  SupportTicket as PrismaSupportTicket,
  SupportMessage as PrismaSupportMessage,
} from '@prisma/client';

type PrismaTripWithItems = PrismaTrip & { items?: PrismaTripItem[] };

export function mapTrip(prismaTrip: PrismaTripWithItems): Trip {
  return {
    id: prismaTrip.id,
    name: prismaTrip.name,
    description: prismaTrip.description,
    startDate: prismaTrip.startDate,
    endDate: prismaTrip.endDate,
    destination: prismaTrip.destination,
    status: prismaTrip.status as TripStatus,
    items: prismaTrip.items?.map(mapTripItem),
    createdAt: prismaTrip.createdAt.toISOString(),
    updatedAt: prismaTrip.updatedAt.toISOString(),
  };
}

export function mapTripItem(item: PrismaTripItem): TripItem {
  const location: Location | null = item.locationName
    ? {
        name: item.locationName,
        address: item.locationAddress ?? null,
        lat: item.locationLat ?? null,
        lng: item.locationLng ?? null,
      }
    : null;

  const price: Price | null =
    item.priceAmount != null
      ? { amount: item.priceAmount, currency: item.priceCurrency ?? 'USD' }
      : null;

  let offer = null;
  if (item.offerData) {
    try {
      offer = JSON.parse(item.offerData);
    } catch (e) {
      console.error(`Malformed offerData for TripItem ${item.id}:`, e);
    }
  }

  let citations: Citation[] | undefined;
  if (item.citationsData) {
    try {
      citations = JSON.parse(item.citationsData);
    } catch (e) {
      console.error(`Malformed citationsData for TripItem ${item.id}:`, e);
    }
  }

  return {
    id: item.id,
    tripId: item.tripId,
    type: item.type as TripItemType,
    title: item.title,
    description: item.description,
    startDateTime: item.startDateTime.toISOString(),
    endDateTime: item.endDateTime?.toISOString() ?? null,
    location,
    confirmationNumber: item.confirmationNumber,
    price,
    status: item.status as TripItemStatus,
    offer,
    citations,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function mapMedia(m: PrismaCachedMedia): Media {
  let attribution: MediaAttribution | null = null;
  if (m.attribution) {
    try {
      attribution = JSON.parse(m.attribution);
    } catch (e) {
      console.error(`Malformed attribution for CachedMedia ${m.id}:`, e);
    }
  }

  const dimensions =
    m.width != null && m.height != null
      ? { width: m.width, height: m.height }
      : null;

  return {
    id: m.id,
    type: m.type as MediaType,
    source: m.source as MediaSource,
    url: m.cachedUrl ?? m.originalUrl,
    thumbnailUrl: m.thumbnailUrl ?? null,
    title: m.title ?? null,
    alt: m.alt ?? null,
    attribution,
    dimensions,
    mimeType: m.mimeType ?? null,
    cachedAt: m.cachedAt.toISOString(),
  };
}

// ============================================================================
// User Mappers
// ============================================================================

export function mapUser(u: PrismaUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    picture: u.picture,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
  };
}

export function mapUserSettings(s: PrismaUserSettings): UserSettings {
  return {
    emailNotifications: s.emailNotifications,
    pushNotifications: s.pushNotifications,
    tripReminders: s.tripReminders,
    priceAlerts: s.priceAlerts,
    timezone: s.timezone,
    dateFormat: s.dateFormat,
    currency: s.currency,
    connectedApps: s.connectedApps ? JSON.parse(s.connectedApps) : [],
  };
}

// ============================================================================
// Points Mappers
// ============================================================================

export function mapPointsAccount(a: PrismaPointsAccount): PointsAccount {
  return {
    id: a.id,
    programType: a.programType as PointsProgramType,
    programName: a.programName,
    membershipTier: a.membershipTier,
    currentBalance: a.currentBalance,
    pendingPoints: a.pendingPoints,
    expiringPoints: a.expiringPoints,
    expirationDate: a.expirationDate?.toISOString() ?? null,
    annualFee: a.annualFee,
    nextFeeDate: a.nextFeeDate?.toISOString() ?? null,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export function mapPointsTransaction(t: PrismaPointsTransaction): PointsTransaction {
  return {
    id: t.id,
    type: t.type as PointsTransactionType,
    amount: t.amount,
    description: t.description,
    transactionDate: t.transactionDate.toISOString(),
    tripItemId: t.tripItemId,
    createdAt: t.createdAt.toISOString(),
  };
}

// ============================================================================
// Safety Mappers
// ============================================================================

export function mapEmergencyContact(c: PrismaEmergencyContact): EmergencyContact {
  return {
    id: c.id,
    name: c.name,
    relationship: c.relationship,
    phone: c.phone,
    email: c.email,
    isPrimary: c.isPrimary,
    notifyOnTripStart: c.notifyOnTripStart,
    notifyOnDelay: c.notifyOnDelay,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function mapUserAlert(a: PrismaUserAlert): UserAlert {
  return {
    id: a.id,
    tripId: a.tripId,
    advisoryId: a.advisoryId,
    alertType: a.alertType as AlertType,
    severity: a.severity as AlertSeverity,
    title: a.title,
    message: a.message,
    actionUrl: a.actionUrl,
    isRead: a.isRead,
    readAt: a.readAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

// ============================================================================
// Support Mappers
// ============================================================================

export function mapSupportTicket(t: PrismaSupportTicket): SupportTicket {
  return {
    id: t.id,
    subject: t.subject,
    category: t.category as TicketCategory,
    priority: t.priority as TicketPriority,
    status: t.status as TicketStatus,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    resolvedAt: t.resolvedAt?.toISOString() ?? null,
  };
}

export function mapSupportMessage(m: PrismaSupportMessage): SupportMessage {
  return {
    id: m.id,
    senderType: m.senderType as MessageSenderType,
    message: m.message,
    attachments: m.attachments ? JSON.parse(m.attachments) : null,
    createdAt: m.createdAt.toISOString(),
  };
}
