import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth routes, static files, and the banned page itself
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/banned"
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) return NextResponse.next();

  // Check if user is banned by calling the session endpoint
  try {
    const res = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user?.banned === true) {
        return NextResponse.redirect(new URL("/banned", req.url));
      }
    }
  } catch {
    // If check fails, allow through
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
