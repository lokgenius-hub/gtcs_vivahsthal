import { Suspense } from "react";
import { SearchFilters } from "@/components/venue/search-filters";
import { VenueListings } from "./venue-listings";

export const metadata = {
  title: "Browse Wedding Venues | VivahSthal",
  description: "Search and discover the perfect wedding venue with advanced filters",
};

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--color-charcoal)] to-[var(--color-charcoal)]/90 pt-12 pb-8 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Find Your Perfect <span className="text-gradient-gold">Venue</span>
          </h1>
          <p className="text-gray-400 mb-6">
            Browse from 500+ handpicked wedding venues across India
          </p>
          <Suspense fallback={<div className="h-14 bg-white/10 rounded-2xl animate-pulse" />}>
            <SearchFilters variant="hero" />
          </Suspense>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          }
        >
          <VenueListings searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
