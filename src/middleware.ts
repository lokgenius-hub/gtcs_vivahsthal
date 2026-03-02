import { NextResponse, type NextRequest } from "next/server";

// Lightweight middleware - no @supabase/ssr import (keeps edge bundle tiny)
// Session refresh is handled by server components via lib/supabase/server.ts
// Role checks are handled inside protected layouts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public paths - no auth check needed
  const publicPaths = ["/partner-register", "/partner/register"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  const protectedPaths = ["/partner", "/admin"];
  const isProtected =
    !isPublicPath && protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    // Check for Supabase auth cookie.
    // @supabase/ssr v0.5+ chunks large JWTs into multiple cookies:
    //   sb-<ref>-auth-token        (small tokens, single cookie)
    //   sb-<ref>-auth-token.0/1/2  (large tokens, chunked)
    // We use .includes() so both forms are detected.
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
    );

    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
