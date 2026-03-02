"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Users, Star, ArrowRight, Heart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Venue } from "@/lib/types";

interface VenueCardProps {
  venue: Venue;
  index?: number;
}

export function VenueCard({ venue, index = 0 }: VenueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/venues/${venue.slug}`} className="group block">
        <div className="card-shine bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[var(--color-primary)]/20">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={
                venue.cover_image ||
                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80"
              }
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {venue.is_featured && (
                <Badge variant="gold" className="text-[10px] uppercase tracking-wide">
                  Featured
                </Badge>
              )}
              <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm text-[10px]">
                {venue.venue_type.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            {/* Wishlist */}
            <button
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors group/heart"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart className="h-4 w-4 text-gray-500 group-hover/heart:text-[var(--color-accent)] transition-colors" />
            </button>

            {/* Bottom Price */}
            <div className="absolute bottom-3 left-3">
              <div className="glass-dark rounded-lg px-3 py-1.5">
                <p className="text-white text-sm font-bold">
                  {formatPrice(venue.price_per_slot)}
                  <span className="text-gray-300 text-xs font-normal"> /slot</span>
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-base text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                {venue.name}
              </h3>
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs">{venue.city}, {venue.state}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {venue.capacity_min}-{venue.capacity_max}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-gray-700">
                    {venue.rating > 0 ? venue.rating.toFixed(1) : "New"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[var(--color-primary)] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View <ArrowRight className="h-3 w-3" />
              </div>
            </div>

            {/* Amenities preview */}
            {venue.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {venue.amenities.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="text-[10px] px-2 py-0.5 bg-[var(--color-warm-gray)] text-gray-600 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {venue.amenities.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 text-gray-400">
                    +{venue.amenities.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
