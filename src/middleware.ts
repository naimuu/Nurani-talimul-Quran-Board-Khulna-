import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nurani_board_khulna_secret_key_2024"
);

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/admin",
  MUHTAMIM: "/madrasa",
  MUALLIM: "/muallim",
  GENERAL: "/",
  TRAINER: "/trainer",
  VISITOR: "/visitor",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Login Routes - redirect if already logged in
  if (pathname.startsWith('/login') || pathname === '/register' || pathname === '/signup') {
    const token = request.cookies.get('auth_token')?.value;
    
    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        const role = verified.payload.role as string;
        const redirectUrl = ROLE_REDIRECT[role] || "/";
        
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch (err) {
        // If token is invalid/expired, let them proceed to login page
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login/:path*',
    '/register',
    '/signup'
  ],
};
