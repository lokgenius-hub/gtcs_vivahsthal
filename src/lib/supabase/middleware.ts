import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Unauthenticated guard ─────────────────────────────────
  // Public signup pages — anyone can register, no auth needed
  const publicPaths = ["/partner-register", "/partner/register"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  const protectedPaths = ["/partner", "/admin"];
  const isProtected = !isPublicPath && protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Role guard (only when logged in on truly protected pages) ────
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;

    // /admin routes → admin or rm only
    if (pathname.startsWith("/admin") && role !== "admin" && role !== "rm") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // /partner routes → vendor or admin only (not plain customer)
    if (
      pathname.startsWith("/partner") &&
      role !== "vendor" &&
      role !== "admin"
    ) {
      // Customer trying to access partner portal → redirect to venues
      return NextResponse.redirect(new URL("/venues", request.url));
    }
  }

  return supabaseResponse;
}
