"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Building2, Calendar, BarChart3, Settings, Home, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/partner/dashboard", icon: BarChart3, label: "Overview" },
  { href: "/partner/venues", icon: Building2, label: "My Venues" },
  { href: "/partner/calendar", icon: Calendar, label: "Availability" },
  { href: "/partner/settings", icon: Settings, label: "Settings" },
  { href: "/", icon: Home, label: "Public Site" },
];

export function MobilePartnerNav() {
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore network error
    } finally {
      // Clear all Supabase auth cookies
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
        }
      });
      // Also clear localStorage keys
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) localStorage.removeItem(key);
        });
      } catch {
        // ignore if localStorage not available
      }
      window.location.href = "/";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="font-bold text-[var(--color-charcoal)]">
                <span className="text-gradient-gold">Vivah</span>Sthal
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary)] transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Sign out */}
            <div className="p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
