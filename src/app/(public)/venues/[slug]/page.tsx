import Image from "next/image";
import { notFound } from "next/navigation";
import { getVenueBySlug, getVendorContact } from "@/lib/actions";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LeadForm } from "@/components/venue/lead-form";
import { AvailabilityCalendar } from "@/components/venue/availability-calendar";
import {
  MapPin, Users, Star, Clock, Check, Wifi,
  Car, UtensilsCrossed, Music, Camera, Shield,
} from "lucide-react";

// Demo venue for when the DB is empty
const demoVenue = {
  id: "1",
  vendor_id: "v1",
  name: "Royal Palace Banquet Hall",
  slug: "royal-palace-banquet",
  description:
    "Step into the grandeur of Royal Palace Banquet Hall — a stunning blend of regal architecture and modern amenities. With ornate chandeliers, marble flooring, and impeccable service, this venue transforms your wedding into a royal celebration. Our dedicated team ensures every detail is perfect, from the mandap setup to the reception décor. Featuring spacious halls, lush lawns, and state-of-the-art sound systems, Royal Palace is where dreams become memories.",
  venue_type: "banquet_hall" as const,
  city: "Patna",
  state: "Bihar",
  address: "Exhibition Rd, Near Gandhi Maidan, Patna 800001",
  pincode: "800001",
  latitude: null,
  longitude: null,
  capacity_min: 100,
  capacity_max: 800,
  price_per_slot: 250000,
  price_per_plate: 800,
  amenities: [
    "AC",
    "Parking",
    "Catering",
    "DJ/Music",
    "Decoration",
    "Valet",
    "Bridal Suite",
    "Lawn",
    "Generator Backup",
    "CCTV",
    "WiFi",
    "Stage",
    "Hawan Kund",
    "Mandap Setup",
  ],
  cover_image:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80",
  images: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
  ],
  is_featured: true,
  is_active: true,
  rating: 4.8,
  total_reviews: 124,
  created_at: "",
  updated_at: "",
};

const amenityIcons: Record<string, React.FC<{ className?: string }>> = {
  WiFi: Wifi,
  Parking: Car,
  Catering: UtensilsCrossed,
  "DJ/Music": Music,
  Photographer: Camera,
  CCTV: Shield,
};

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let venue = await getVenueBySlug(slug);

  // Fallback to demo if DB is empty
  if (!venue) {
    if (slug === "royal-palace-banquet") {
      venue = demoVenue;
    } else {
      notFound();
    }
  }

  const vendorContact = venue.id !== "1" ? await getVendorContact(venue.id) : null;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Hero Gallery */}
      <div className="relative h-[50vh] lg:h-[60vh]">
        <Image
          src={venue.cover_image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80"}
          alt={venue.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Overlaid Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap gap-2 mb-3">
              {venue.is_featured && <Badge variant="gold">Featured</Badge>}
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {venue.venue_type.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2">
              {venue.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {venue.address}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {venue.capacity_min} - {venue.capacity_max} guests
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                {venue.rating} ({venue.total_reviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Thumbnails */}
      {venue.images.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
            {venue.images.map((img, i) => (
              <div key={i} className="relative h-20 w-32 rounded-lg overflow-hidden shrink-0 border-2 border-white shadow-md">
                <Image src={img} alt={`${venue!.name} ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">About This Venue</h2>
              <p className="text-gray-600 leading-relaxed">{venue.description}</p>
            </section>

            {/* Pricing */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-cream)] rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Per Slot</p>
                  <p className="text-2xl font-bold text-gradient-gold">
                    {formatPrice(venue.price_per_slot)}
                  </p>
                </div>
                {venue.price_per_plate && (
                  <div className="bg-[var(--color-cream)] rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Per Plate</p>
                    <p className="text-2xl font-bold text-[var(--color-charcoal)]">
                      {formatPrice(venue.price_per_plate)}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Slots: Morning (6AM-2PM) · Evening (4PM-12AM) · Full Day</span>
              </div>
            </section>

            {/* Amenities */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {venue.amenities.map((amenity) => {
                  const IconComp = amenityIcons[amenity];
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm text-gray-700 bg-[var(--color-cream)] rounded-lg px-3 py-2.5"
                    >
                      {IconComp ? (
                        <IconComp className="h-4 w-4 text-[var(--color-primary)]" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {amenity}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Availability Calendar */}
            <AvailabilityCalendar
              venueId={venue.id}
              venueName={venue.name}
              vendorPhone={vendorContact?.phone ?? null}
              vendorName={vendorContact?.full_name ?? null}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Starting from</p>
                <p className="text-3xl font-bold text-gradient-gold">
                  {formatPrice(venue.price_per_slot)}
                </p>
                <p className="text-xs text-gray-400">per slot</p>
              </div>

              <div className="space-y-3">
                <LeadForm
                  venueId={venue.id}
                  venueName={venue.name}
                  trigger="availability"
                />
                <LeadForm
                  venueId={venue.id}
                  venueName={venue.name}
                  trigger="contact"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center mb-3">
                  Capacity
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-[var(--color-primary)]" />
                  <span className="text-lg font-semibold">
                    {venue.capacity_min} - {venue.capacity_max}
                  </span>
                  <span className="text-sm text-gray-500">guests</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                <p className="text-xs text-amber-800 text-center">
                  💡 Tip: Morning slots are ideal for ceremonies, evening for receptions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
