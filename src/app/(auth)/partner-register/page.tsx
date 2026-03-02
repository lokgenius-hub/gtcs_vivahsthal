"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { signUpUser, upgradeToVendor } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/lib/constants";

export default function PartnerRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Detect if user is already logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setLoggedInEmail(user.email ?? null);
        setLoggedInRole((user.user_metadata?.role as string) ?? "customer");
      }
      setCheckingAuth(false);
    });
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    const result = await upgradeToVendor();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = "/partner/venues";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signUpUser({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        full_name: formData.get("full_name") as string,
        phone: formData.get("phone") as string,
        role: "vendor",
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.needsConfirmation) {
        setInfo(
          "Registration successful! Please check your email to confirm your account, then sign in."
        );
        setLoading(false);
        return;
      }

      // Full page reload so session cookies set by the server action are sent on the next request
      window.location.href = "/partner/venues";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("networkerror")
      ) {
        setError(
          "Cannot reach the server. Your Supabase project may be paused. " +
            "Please visit supabase.com/dashboard, open your project, click 'Restore project', then try again."
        );
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-gradient-gold">Vivah</span>
              <span className="text-[var(--color-charcoal)]">Sthal</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="h-14 w-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-7 w-7 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">
              Partner Registration
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              List your venue on India&apos;s premium wedding marketplace
            </p>
          </div>

          {/* Already logged in as customer → show upgrade CTA */}
          {!checkingAuth && loggedInEmail && loggedInRole !== "vendor" && loggedInRole !== "admin" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 font-medium mb-1">
                You&apos;re signed in as <span className="font-bold">{loggedInEmail}</span>
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Upgrade your existing account to a Vendor account — no new registration needed.
              </p>
              {error && (
                <p className="text-xs text-red-600 mb-2">{error}</p>
              )}
              <Button onClick={handleUpgrade} loading={loading} className="w-full">
                <ArrowRight className="h-4 w-4" />
                Become a Partner Now
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Or{" "}
                <button
                  className="text-[var(--color-primary)] underline"
                  onClick={() => setLoggedInEmail(null)}
                >
                  register with a different account
                </button>
              </p>
            </div>
          )}

          {/* Already a vendor → go to dashboard */}
          {!checkingAuth && loggedInEmail && (loggedInRole === "vendor" || loggedInRole === "admin") && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-sm text-green-800 font-medium mb-3">
                You&apos;re already registered as a partner!
              </p>
              <Link href="/partner/venues">
                <Button className="w-full">
                  <ArrowRight className="h-4 w-4" />
                  Go to My Venues
                </Button>
              </Link>
            </div>
          )}

          {/* Show regular form only if not logged in (or overriding) */}
          {(checkingAuth || !loggedInEmail) && (
            <>
              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
              {info && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 space-y-2">
                  <p className="font-medium">✅ {info}</p>
                  <Link
                    href="/login"
                    className="inline-block mt-1 text-[var(--color-primary)] font-semibold underline"
                  >
                    Go to Sign In →
                  </Link>
                </div>
              )}

              {/* Form */}
              {!info && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="full_name"
                    label="Your Name"
                    placeholder="Full name"
                    icon={<User className="h-4 w-4" />}
                    required
                  />
                  <Input
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="+91 XXXXX XXXXX"
                    icon={<Phone className="h-4 w-4" />}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Business Email"
                    placeholder="you@business.com"
                    icon={<Mail className="h-4 w-4" />}
                    required
                  />
                  <Select
                    name="city"
                    label="City"
                    options={CITIES.map((c) => ({ value: c, label: c }))}
                    placeholder="Select your city"
                  />
                  <Input
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Minimum 6 characters"
                    icon={<Lock className="h-4 w-4" />}
                    required
                    minLength={6}
                  />

                  <Button type="submit" className="w-full" loading={loading}>
                    Register as Partner
                  </Button>
                </form>
              )}
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Already a partner?{" "}
            <Link
              href="/login"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-2 text-center text-sm text-gray-400">
            Looking to book a venue?{" "}
            <Link
              href="/register"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Customer Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
