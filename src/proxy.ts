import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  STUDIO_COOKIE,
  isStudioConfigured,
  verifySessionToken,
} from "@/lib/studio/auth";

export const config = {
  matcher: "/studio/:path*",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login screen must stay reachable without a session.
  if (pathname === "/studio/login") {
    return NextResponse.next();
  }

  if (!isStudioConfigured()) {
    const url = new URL("/studio/login", request.url);
    url.searchParams.set("error", "unconfigured");
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(STUDIO_COOKIE)?.value;
  if (verifySessionToken(token)) {
    return NextResponse.next();
  }

  const url = new URL("/studio/login", request.url);
  if (pathname !== "/studio") {
    url.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(url);
}
