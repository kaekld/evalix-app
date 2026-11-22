import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

const roleRoutes: Record<string, string[]> = {
  ALUMNO: ['/alumno'],
  DOCENTE: ['/docente'],
  ADMINISTRADOR: ['/administrador'],
};

const publicPaths = [
  '/login',
  '/admin',
  '/api/auth/login',
  '/api/auth/register',
  '/api/admin/login',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Admin panel routes - check admin_token cookie
  if (pathname.startsWith('/admin/panel')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    try {
      const { payload } = await jwtVerify(adminToken, secret);
      if (payload.rol !== 'ADMINISTRADOR') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub as string);
      response.headers.set('x-user-email', payload.email as string);
      response.headers.set('x-user-role', payload.rol as string);
      return response;
    } catch {
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Legacy /administrador routes - check auth_token cookie
  if (pathname.startsWith('/administrador')) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.rol as string;
      if (userRole !== 'ADMINISTRADOR') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub as string);
      response.headers.set('x-user-email', payload.email as string);
      response.headers.set('x-user-role', userRole);
      return response;
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Student and teacher routes - check auth_token cookie
  const isProtected = Object.entries(roleRoutes).some(([role, routes]) => {
    if (role === 'ADMINISTRADOR') return false; // handled above
    return routes.some((route) => pathname.startsWith(route));
  });

  if (!isProtected) {
    return NextResponse.next();
  }

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
    '/admin/panel/:path*',
  ],
};