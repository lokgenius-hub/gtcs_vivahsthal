"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const handleSignOut = async () => {
    const supabase = createClient();
    // Clear local session first (works even if Supabase is paused / unreachable)
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore
    }
    // Best-effort full server-side invalidation
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    window.location.href = "/";
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
