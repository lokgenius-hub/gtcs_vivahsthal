import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role") ?? "customer"; // passed from register page for vendor flow

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Ensure profile exists (OAuth users may bypass trigger)
      try {
        const serviceClient = await createServiceClient();
        await serviceClient.from("profiles").upsert(
          {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User",
            email: user.email!,
            phone: user.user_metadata?.phone || null,
            role: (role as "customer" | "vendor" | "admin" | "rm") ?? "customer",
          },
          { onConflict: "id", ignoreDuplicates: true }
        );
      } catch {
        // Non-fatal — profile may already exist
      }

      // Role-based redirect
      try {
        const serviceClient = await createServiceClient();
        const { data: profile } = await serviceClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "vendor") {
          return NextResponse.redirect(`${origin}/partner/dashboard`);
        } else if (profile?.role === "admin" || profile?.role === "rm") {
          return NextResponse.redirect(`${origin}/admin/leads`);
        }
      } catch {
        // Fall through to default
      }

      return NextResponse.redirect(`${origin}/venues`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
