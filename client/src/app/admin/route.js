import { NextResponse } from 'next/server';

// This route handler redirects from /admin to /admin/sections
export function GET(request) {
  // Get the current origin from the request
  const origin = request.headers.get('x-forwarded-host') || 
                request.headers.get('host') || 
                process.env.NEXT_PUBLIC_BASE_URL || 
                'localhost:3000';
  
  // Determine protocol (https for production, http for localhost)
  const protocol = origin.includes('localhost') ? 'http' : 'https';
  
  // Create the full URL for redirection
  const baseUrl = `${protocol}://${origin}`;
  
  return NextResponse.redirect(new URL('/admin/sections', baseUrl));
}
