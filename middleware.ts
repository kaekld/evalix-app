import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

const roleRoutes: Record<string, string[]> = {
  ALUMNO: ['/alumno'],
  DOCENTE: ['/docente'],
  ADMINISTRADOR: ['/administrador'],
};

const publicPaths = ['/login', '/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path is protected
  const isProtected = Object.values(roleRoutes).some((routes) =>
    routes.some((route) => pathname.startsWith(route))
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get token from HttpOnly cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.rol as string;

    // Check role access
    const allowedRoutes = roleRoutes[userRole] || [];
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      // Redirect to correct dashboard based on role
      const correctPath = allowedRoutes[0] || '/login';
      return NextResponse.redirect(new URL(correctPath, request.url));
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub as string);
    response.headers.set('x-user-email', payload.email as string);
    response.headers.set('x-user-role', userRole);
    return response;
  } catch {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/docente/:path*',
    '/alumno/:path*',
    '/administrador/:path*',
  ],
};