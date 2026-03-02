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
      // Always wipe Supabase cookies regardless of API success/failure
      document.cookie.split(";").forEach((c) => {
        const name = c.split("=")[0].trim();
        if (name.startsWith("sb-")) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure`;
        }
      });
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
