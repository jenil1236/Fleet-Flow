
import { auth } from '@/lib/auth';

// Middleware to protect routes and enforce role-based access
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/api/auth/signin',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/csrf',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/signout',
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Allow access to public routes
  if (isPublicRoute) {
    return;
  }

  // Redirect unauthenticated users to login
  if (!session) {
    return Response.redirect(new URL('/login', req.url));
  }

  // Protect /admin routes - only SUPER_ADMIN can access
  if (pathname.startsWith('/admin')) {
    if (session.user?.role !== 'SUPER_ADMIN') {
      // Redirect non-admin users to home
      return Response.redirect(new URL('/', req.url));
    }
  }

  // Allow authenticated users to proceed
  return;
});

// Configure which routes the middleware should run on
export const config = {
  runtime: 'nodejs', // This is the magic switch
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
