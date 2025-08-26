import { NextResponse } from 'next/server';

// This route handler redirects from /admin to /admin/sections
export function GET() {
  return NextResponse.redirect(new URL('/admin/sections', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
