import { auth0 } from './auth0';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  auth0Id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

/**
 * Get the current authenticated user from session.
 * Creates or updates user in database on each call.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth0.getSession();
  if (!session?.user) return null;

  const { sub, email, name, picture, nickname, email_verified } = session.user;

  if (!sub || !email) {
    console.error('Auth0 session missing required fields (sub, email)');
    return null;
  }

  // Upsert user on each request (handles profile updates from Auth0)
  const user = await prisma.user.upsert({
    where: { auth0Id: sub },
    update: {
      email,
      name: name || nickname || null,
      picture: picture || null,
      emailVerified: email_verified ?? false,
      lastLoginAt: new Date(),
    },
    create: {
      auth0Id: sub,
      email,
      name: name || nickname || null,
      picture: picture || null,
      emailVerified: email_verified ?? false,
      lastLoginAt: new Date(),
    },
  });

  return {
    id: user.id,
    auth0Id: user.auth0Id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  };
}

/**
 * Require authentication - throws if not authenticated.
 * Use in API routes where authentication is mandatory.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Get user by ID from database.
 */
export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  return {
    id: user.id,
    auth0Id: user.auth0Id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  };
}

/**
 * Get user by email from database.
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;

  return {
    id: user.id,
    auth0Id: user.auth0Id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  };
}
