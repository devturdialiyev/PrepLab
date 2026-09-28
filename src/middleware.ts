import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Check if public path or static resource
  if (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith("/_next") || pathname.startsWith("/static"))
  ) {
    return NextResponse.next();
  }

  // Handle subdomain rewrites if present
  // e.g., ielts.localhost:3000 -> /ielts/*
  // sat.localhost:3000 -> /sat/*
  // admin.localhost:3000 -> /super-admin/*
  if (host.startsWith("ielts.") && !pathname.startsWith("/ielts") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/ielts${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (host.startsWith("sat.") && !pathname.startsWith("/sat") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/sat${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (host.startsWith("admin.") && !pathname.startsWith("/super-admin") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/super-admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Authentication check
  const token = request.cookies.get("edu_session_token")?.value;
  if (!token && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, audio or files in public
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
