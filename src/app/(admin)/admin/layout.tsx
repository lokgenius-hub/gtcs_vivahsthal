import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Phone, Users, Settings, Home, Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin/leads");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Only allow admin/rm
  if (profile && !["admin", "rm"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[var(--color-charcoal)] flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-bold text-white">
              <span className="text-gradient-gold">Admin</span> Portal
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: "/admin/leads", icon: Phone, label: "Leads" },
            { href: "/admin/venues", icon: LayoutDashboard, label: "All Venues" },
            { href: "/admin/users", icon: Users, label: "Users" },
            { href: "/admin/settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-white text-xs font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{profile?.full_name || "Admin"}</p>
              <p className="text-xs text-gray-500">{profile?.role?.toUpperCase()}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300">
            <Home className="h-3 w-3" /> Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden bg-[var(--color-charcoal)] px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm">Admin Portal</span>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
