import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Check if the request is for an admin page (excluding login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Get the token from the cookie
    const token = request.cookies.get('accessToken')?.value;
    
    // If there's no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      // Add a redirect parameter to return after login
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

// Configure the paths that this middleware should run on
export const config = {
  matcher: ['/admin/:path*']
};
