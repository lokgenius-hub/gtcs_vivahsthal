"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[var(--color-charcoal)]/85" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Plan Your <span className="text-gradient-gold">Dream Wedding</span>?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of happy couples who found their perfect venue through VivahSthal.
            Your celebration deserves the best.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/venues">
              <Button size="xl">
                Explore Venues <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partner-register">
              <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white hover:text-[var(--color-charcoal)]">
                List Your Venue
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
