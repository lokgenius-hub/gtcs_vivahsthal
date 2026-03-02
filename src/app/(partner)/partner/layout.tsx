import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Calendar, BarChart3, Settings, Home } from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { MobilePartnerNav } from "@/components/layout/mobile-partner-nav";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/partner/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Double-check role (middleware handles most cases, but belt-and-suspenders)
  if (profile?.role !== "vendor" && profile?.role !== "admin") {
    redirect("/venues");
  }

  const navItems = [
    { href: "/partner/dashboard", icon: BarChart3, label: "Overview" },
    { href: "/partner/venues", icon: Building2, label: "My Venues" },
    { href: "/partner/calendar", icon: Calendar, label: "Availability" },
    { href: "/partner/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Brand + role badge */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-bold">
              <span className="text-gradient-gold">Vivah</span>
              <span className="text-[var(--color-charcoal)]">Sthal</span>
            </span>
          </Link>
          {/* ── Partner Portal badge ── */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
              Partner Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)] transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Profile footer */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-white text-sm font-bold uppercase">
              {profile?.full_name?.[0] || "P"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "Partner"}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="h-3 w-3" /> Public site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-sm">
              <span className="text-gradient-gold">Vivah</span>Sthal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full">
              Partner Portal
            </span>
            <MobilePartnerNav />
          </div>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

