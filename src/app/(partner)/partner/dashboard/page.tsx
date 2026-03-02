import { createClient } from "@/lib/supabase/server";
import { Building2, Eye, Phone, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Vendor Dashboard | VivahSthal",
};

export default async function PartnerDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch vendor stats
  const { count: venueCount } = await supabase
    .from("venues")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", user?.id || "");

  const { count: leadCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  const stats = [
    { icon: Building2, label: "My Venues", value: venueCount || 0, color: "bg-blue-50 text-blue-600" },
    { icon: Eye, label: "Profile Views", value: "1,234", color: "bg-amber-50 text-amber-600" },
    { icon: Phone, label: "New Leads", value: leadCount || 0, color: "bg-green-50 text-green-600" },
    { icon: TrendingUp, label: "Conversion", value: "12%", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s an overview of your venue performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--color-charcoal)]">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/partner/venues"
            className="p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-center"
          >
            <Building2 className="h-8 w-8 mx-auto mb-2 text-[var(--color-primary)]" />
            <p className="text-sm font-medium">Manage Venues</p>
            <p className="text-xs text-gray-400 mt-1">Add or edit your listings</p>
          </a>
          <a
            href="/partner/calendar"
            className="p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-center"
          >
            <Eye className="h-8 w-8 mx-auto mb-2 text-[var(--color-primary)]" />
            <p className="text-sm font-medium">Update Availability</p>
            <p className="text-xs text-gray-400 mt-1">Mark slots & auspicious dates</p>
          </a>
          <a
            href="/partner/settings"
            className="p-4 rounded-lg border border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-center"
          >
            <Phone className="h-8 w-8 mx-auto mb-2 text-[var(--color-primary)]" />
            <p className="text-sm font-medium">View Leads</p>
            <p className="text-xs text-gray-400 mt-1">Manage incoming inquiries</p>
          </a>
        </div>
      </div>
    </div>
  );
}
