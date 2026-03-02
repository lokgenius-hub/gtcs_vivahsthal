"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import { SearchFilters } from "@/components/venue/search-filters";
import { Sparkles, Heart, Calendar } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[var(--color-cream)]" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <Sparkles className="h-12 w-12 text-amber-300" />
      </div>
      <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: "1s" }}>
        <Heart className="h-10 w-10 text-rose-300" />
      </div>
      <div className="absolute bottom-40 left-1/4 animate-float opacity-20" style={{ animationDelay: "2s" }}>
        <Calendar className="h-8 w-8 text-amber-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              India&apos;s Premium Wedding Venue Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          >
            Find Your Dream{" "}
            <span className="text-gradient-gold">Wedding Venue</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto"
          >
            Discover exquisite banquet halls, resorts & heritage venues with
            real-time availability. Check auspicious dates and book your perfect
            celebration.
          </motion.p>
        </div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Suspense fallback={<div className="h-20 glass rounded-2xl animate-pulse" />}>
            <SearchFilters variant="hero" />
          </Suspense>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-8 mt-12 text-white/70 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            500+ Venues Listed
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            Real-time Availability
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-400" />
            AI-Powered Search
          </div>
        </motion.div>
      </div>
    </section>
  );
}
