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
  const token = request.cookies.get('auth_token')?.value;

  // 1. Protect Login Routes - redirect if already logged in
  if (pathname.startsWith('/login') || pathname === '/register' || pathname === '/signup') {
    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        const role = (verified.payload.role as string)?.toUpperCase() || "GENERAL";
        const redirectUrl = ROLE_REDIRECT[role] || "/";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch (err) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 2. Strict Protection for Admin Web Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Allow admin login page itself for unauthenticated visitors
    if (pathname === '/admin/login') {
      if (token) {
        try {
          const verified = await jwtVerify(token, JWT_SECRET);
          const role = (verified.payload.role as string)?.toUpperCase();
          if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
          if (role === 'VISITOR') {
            return NextResponse.redirect(new URL('/visitor', request.url));
          }
          return NextResponse.redirect(new URL(ROLE_REDIRECT[role] || '/', request.url));
        } catch {
          return NextResponse.next();
        }
      }
      return NextResponse.next();
    }

    // All other /admin routes require strict ADMIN role
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const role = (verified.payload.role as string)?.toUpperCase();
      
      // If role is NOT ADMIN (e.g. VISITOR), strictly block and redirect!
      if (role !== 'ADMIN') {
        if (role === 'VISITOR') {
          return NextResponse.redirect(new URL('/visitor', request.url));
        }
        return NextResponse.redirect(new URL(ROLE_REDIRECT[role] || '/', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // 3. Strict Protection for Admin API Routes (/api/admin/* and /api/inspection/review)
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/inspection/review')) {
    if (!token) {
      return NextResponse.json({ error: "অননুমোদিত প্রবেশাধিকার। লগইন আবশ্যক।" }, { status: 401 });
    }

    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const role = (verified.payload.role as string)?.toUpperCase();
      if (role !== 'ADMIN') {
        return NextResponse.json(
          { error: "অননুমোদিত প্রবেশাধিকার। শুধুমাত্র কেন্দ্রীয় বোর্ড অ্যাডমিন এই কার্যক্রমে প্রবেশ করতে পারেন।" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json({ error: "অবৈধ বা মেয়াদোত্তীর্ণ সেশন।" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // 4. Protection for Visitor Panel (/visitor/*)
  if (pathname.startsWith('/visitor')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login/visitor', request.url));
    }

    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const role = (verified.payload.role as string)?.toUpperCase();
      
      // Allow VISITOR and ADMIN
      if (role !== 'VISITOR' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL(ROLE_REDIRECT[role] || '/', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/login/visitor', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login/:path*',
    '/register',
    '/signup',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/inspection/review/:path*',
    '/visitor/:path*',
  ],
};
