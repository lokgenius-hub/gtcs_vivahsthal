"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Users, Calendar, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CITIES, VENUE_TYPES, BUDGET_RANGES, SLOT_TYPES } from "@/lib/constants";

interface SearchFiltersProps {
  variant?: "hero" | "page";
}

export function SearchFilters({ variant = "page" }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    venue_type: searchParams.get("type") || "",
    capacity: searchParams.get("capacity") || "",
    budget: searchParams.get("budget") || "",
    date: searchParams.get("date") || "",
    slot_type: searchParams.get("slot") || "",
    auspicious_only: searchParams.get("auspicious") === "true",
    q: searchParams.get("q") || "",
  });

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.venue_type) params.set("type", filters.venue_type);
    if (filters.capacity) params.set("capacity", filters.capacity);
    if (filters.budget) params.set("budget", filters.budget);
    if (filters.date) params.set("date", filters.date);
    if (filters.slot_type) params.set("slot", filters.slot_type);
    if (filters.auspicious_only) params.set("auspicious", "true");
    if (filters.q) params.set("q", filters.q);
    router.push(`/venues?${params.toString()}`);
  }, [filters, router]);

  const clearFilters = () => {
    setFilters({
      city: "",
      venue_type: "",
      capacity: "",
      budget: "",
      date: "",
      slot_type: "",
      auspicious_only: false,
      q: "",
    });
    router.push("/venues");
  };

  const isHero = variant === "hero";

  return (
    <div className={isHero ? "" : "bg-white rounded-2xl shadow-lg border border-gray-100 p-6"}>
      {/* Main Search Bar */}
      <div
        className={`flex flex-col md:flex-row gap-3 ${
          isHero
            ? "glass rounded-2xl p-4 shadow-2xl border border-white/30"
            : ""
        }`}
      >
        <div className="flex-1">
          <Input
            placeholder="Search venues, cities, or keywords..."
            icon={<Search className="h-4 w-4" />}
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className={isHero ? "h-12 bg-white/90 border-0 shadow-md" : ""}
          />
        </div>
        <Select
          options={CITIES.map((c) => ({ value: c, label: c }))}
          placeholder="All Cities"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className={`md:w-48 ${isHero ? "h-12 bg-white/90 border-0 shadow-md" : ""}`}
        />
        <Select
          options={VENUE_TYPES.map((v) => ({ value: v.value, label: v.label }))}
          placeholder="Venue Type"
          value={filters.venue_type}
          onChange={(e) => setFilters({ ...filters, venue_type: e.target.value })}
          className={`md:w-48 ${isHero ? "h-12 bg-white/90 border-0 shadow-md" : ""}`}
        />
        <Button
          onClick={handleSearch}
          size={isHero ? "lg" : "default"}
          className={isHero ? "h-12 px-8" : ""}
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1.5 hover:underline"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {showAdvanced ? "Hide" : "More"} Filters
        </button>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.auspicious_only}
            onChange={(e) => setFilters({ ...filters, auspicious_only: e.target.checked })}
            className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Auspicious Dates Only
          </span>
        </label>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Guest Count</label>
            <Input
              type="number"
              placeholder="e.g. 300"
              icon={<Users className="h-4 w-4" />}
              value={filters.capacity}
              onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Budget</label>
            <Select
              options={BUDGET_RANGES.map((b) => ({ value: b.value, label: b.label }))}
              placeholder="Any Budget"
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Event Date</label>
            <Input
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Time Slot</label>
            <Select
              options={SLOT_TYPES.map((s) => ({ value: s.value, label: s.label }))}
              placeholder="Any Slot"
              value={filters.slot_type}
              onChange={(e) => setFilters({ ...filters, slot_type: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" /> Clear All
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
