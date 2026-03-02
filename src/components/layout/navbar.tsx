"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Search, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/venues", label: "Venues" },
  { href: "/venues?auspicious=true", label: "Auspicious Dates" },
  { href: "/about", label: "About" },
];

function getDashboardHref(role?: string) {
  if (role === "vendor") return "/partner/dashboard";
  if (role === "admin" || role === "rm") return "/admin/leads";
  return "/venues";
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(data?.role);
      }
    });

    // Listen for auth changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();
        setRole(data?.role);
      } else {
        setRole(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // If API call fails (e.g. Supabase paused), manually expire all sb-* cookies
    } finally {
      // Always wipe Supabase cookies regardless of API success/failure
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
        }
      });
      // Also clear localStorage session keys
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) localStorage.removeItem(key);
        });
      } catch {
        // ignore
      }
      setUser(null);
      setRole(undefined);
      setDropdownOpen(false);
      window.location.href = "/";
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  // Use DB role when loaded, fall back to user_metadata.role (available immediately from auth)
  const effectiveRole = role ?? (user?.user_metadata?.role as string | undefined);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-md">
              <span className="text-white font-bold text-lg">V</span>
              <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gradient-gold">Vivah</span>
              <span className="text-[var(--color-charcoal)]">Sthal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-gold after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/venues">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {user ? (
              /* ── Logged-in user menu ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[var(--color-primary)] bg-white hover:bg-[var(--color-primary)]/5 transition-colors text-sm font-medium text-gray-700"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-gold flex items-center justify-center text-white text-xs font-bold uppercase">
                    {displayName[0]}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  {/* Role pill inline — visible at a glance */}
                  {effectiveRole && effectiveRole !== "customer" && (
                    <span className="hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
                      {effectiveRole === "vendor" ? "Partner" : effectiveRole}
                    </span>
                  )}
                  <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-lg overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                        {effectiveRole && (
                          <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
                            {effectiveRole === "vendor" ? "Partner / Vendor" : effectiveRole}
                          </span>
                        )}
                      </div>

                      {/* Partner Portal — highlighted for vendors */}
                      {(effectiveRole === "vendor" || effectiveRole === "admin") && (
                        <Link
                          href="/partner/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors border-b border-gray-100"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Partner Portal
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                        </Link>
                      )}

                      {/* Admin panel */}
                      {(effectiveRole === "admin" || effectiveRole === "rm") && (
                        <Link
                          href="/admin/leads"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Admin Panel
                        </Link>
                      )}

                      {/* Customer dashboard = browse venues */}
                      {effectiveRole === "customer" && (
                        <Link
                          href="/venues"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Browse Venues
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest ── */
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}

            {/* Vendors already registered go straight to their venue manager */}
            <Link href={effectiveRole === "vendor" || effectiveRole === "admin" ? "/partner/venues" : "/partner-register"}>
              <Button size="sm">
                {effectiveRole === "vendor" || effectiveRole === "admin" ? "My Venues" : "List Your Venue"}
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-gray-200/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200/50 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Signed in as <span className="font-medium text-gray-700">{displayName}</span>
                      {effectiveRole && effectiveRole !== "customer" && (
                        <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] capitalize">
                          {effectiveRole === "vendor" ? "Partner" : effectiveRole}
                        </span>
                      )}
                    </div>
                    {(effectiveRole === "vendor" || effectiveRole === "admin") && (
                      <Link href="/partner/dashboard" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                          <LayoutDashboard className="h-4 w-4" /> Partner Portal
                        </Button>
                      </Link>
                    )}
                    {(effectiveRole === "admin" || effectiveRole === "rm") && (
                      <Link href="/admin/leads" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="h-4 w-4" /> Admin Panel
                        </Button>
                      </Link>
                    )}
                    {effectiveRole === "customer" && (
                      <Link href="/venues" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="h-4 w-4" /> Browse Venues
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4" /> Login
                      </Button>
                    </Link>
                    <Link href="/partner-register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">List Your Venue</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
