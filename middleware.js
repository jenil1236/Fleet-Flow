
import { auth } from '@/lib/auth';

// Middleware to protect routes and enforce role-based access
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/landing',
    '/api/auth/signin',
    '/api/auth/callback',
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/csrf',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/signout',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/reset-password-required',
  ];

  // Auth pages that should redirect to dashboard if already logged in
  const authPages = ['/login', '/register', '/forgot-password','/reset-password', '/landing', '/'];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages to dashboard
  if (session && authPages.includes(pathname)) {
    // Redirect based on role
    if (session.user.role === 'SAFETY_OFFICER') {
      return Response.redirect(new URL('/dashboard-safety', req.url));
    }
    if (session.user.role === 'DISPATCHER') {
      return Response.redirect(new URL('/dashboard-dispatcher', req.url));
    }
    if (session.user.role === 'DRIVER') {
      return Response.redirect(new URL('/dashboard-driver', req.url));
    }
    if (session.user.role === 'FINANCIAL_ANALYST') {
      return Response.redirect(new URL('/dashboard-financial', req.url));
    }
    return Response.redirect(new URL('/dashboard', req.url));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return;
  }

  // Redirect unauthenticated users to login
  if (!session) {
    return Response.redirect(new URL('/login', req.url));
  }

  // Force password reset on first login
  if (session.user?.mustResetPassword && pathname !== '/reset-password-required') {
    return Response.redirect(new URL('/reset-password-required', req.url));
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
  runtime: 'nodejs',
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
