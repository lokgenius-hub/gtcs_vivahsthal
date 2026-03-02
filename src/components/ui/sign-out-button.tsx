"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
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
      // Also clear localStorage session keys
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
    <button
      type="button"
      onClick={handleSignOut}
      className={
        className ??
        "flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
      }
    >
      <LogOut className="h-3 w-3" /> Sign out
    </button>
  );
}
