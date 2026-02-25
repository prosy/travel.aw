import type { NextRequest } from 'next/server';
import { auth0 } from './app/_lib/auth0';

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - Static files (_next/static, _next/image, favicon, etc.)
     * - Public API routes that intentionally require no auth:
     *     /api/auth/(.*)   — Auth0 login/callback flow
     *     /api/safety/advisories — public travel advisories
     *     /api/support/faq — public FAQ
     *     /api/media — public cached media (B6: safer to leave public, gate in B1B2 if needed)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth/|api/safety/advisories|api/support/faq|api/media).*)',
  ],
};
