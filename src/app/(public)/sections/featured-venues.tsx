import { getFeaturedVenues } from "@/lib/actions";
import { VenueCard } from "@/components/venue/venue-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import Link from "next/link";

export async function FeaturedVenues() {
  const venues = await getFeaturedVenues();

  // Demo venues if database is empty
  const displayVenues =
    venues.length > 0
      ? venues
      : [
          {
            id: "1",
            vendor_id: "v1",
            name: "Royal Palace Banquet Hall",
            slug: "royal-palace-banquet",
            description: "An opulent banquet hall with regal architecture",
            venue_type: "banquet_hall" as const,
            city: "Patna",
            state: "Bihar",
            address: "Exhibition Rd, Patna",
            pincode: "800001",
            latitude: null,
            longitude: null,
            capacity_min: 100,
            capacity_max: 800,
            price_per_slot: 250000,
            price_per_plate: 800,
            amenities: ["AC", "Parking", "Catering", "DJ/Music", "Decoration"],
            cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
            images: [],
            is_featured: true,
            is_active: true,
            rating: 4.8,
            total_reviews: 124,
            created_at: "",
            updated_at: "",
          },
          {
            id: "2",
            vendor_id: "v2",
            name: "Garden Paradise Resort",
            slug: "garden-paradise-resort",
            description: "Beautiful garden and lawns for outdoor celebrations",
            venue_type: "resort" as const,
            city: "Gaya",
            state: "Bihar",
            address: "NH 83, Gaya",
            pincode: "823001",
            latitude: null,
            longitude: null,
            capacity_min: 200,
            capacity_max: 1200,
            price_per_slot: 400000,
            price_per_plate: 1200,
            amenities: ["Lawn", "Parking", "Catering", "Swimming Pool", "Bridal Suite"],
            cover_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
            images: [],
            is_featured: true,
            is_active: true,
            rating: 4.6,
            total_reviews: 89,
            created_at: "",
            updated_at: "",
          },
          {
            id: "3",
            vendor_id: "v3",
            name: "Heritage Haveli",
            slug: "heritage-haveli",
            description: "A centuries-old haveli reimagined for grand celebrations",
            venue_type: "heritage" as const,
            city: "Muzaffarpur",
            state: "Bihar",
            address: "Club Rd, Muzaffarpur",
            pincode: "842001",
            latitude: null,
            longitude: null,
            capacity_min: 50,
            capacity_max: 500,
            price_per_slot: 350000,
            price_per_plate: 1000,
            amenities: ["AC", "Parking", "Hawan Kund", "Mandap Setup", "Stage", "Decoration"],
            cover_image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80",
            images: [],
            is_featured: true,
            is_active: true,
            rating: 4.9,
            total_reviews: 67,
            created_at: "",
            updated_at: "",
          },
          {
            id: "4",
            vendor_id: "v4",
            name: "Lakeside Farmhouse",
            slug: "lakeside-farmhouse",
            description: "A serene lakeside farmhouse",
            venue_type: "farmhouse" as const,
            city: "Bhagalpur",
            state: "Bihar",
            address: "Tilka Manjhi Rd, Bhagalpur",
            pincode: "812001",
            latitude: null,
            longitude: null,
            capacity_min: 100,
            capacity_max: 600,
            price_per_slot: 180000,
            price_per_plate: 600,
            amenities: ["Lawn", "Parking", "Kitchen", "Generator Backup", "CCTV"],
            cover_image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
            images: [],
            is_featured: true,
            is_active: true,
            rating: 4.5,
            total_reviews: 42,
            created_at: "",
            updated_at: "",
          },
          {
            id: "5",
            vendor_id: "v5",
            name: "Grand Convention Center",
            slug: "grand-convention-center",
            description: "Massive convention center for large celebrations",
            venue_type: "convention_center" as const,
            city: "Patna",
            state: "Bihar",
            address: "Boring Rd, Patna",
            pincode: "800001",
            latitude: null,
            longitude: null,
            capacity_min: 300,
            capacity_max: 2000,
            price_per_slot: 500000,
            price_per_plate: 1500,
            amenities: ["AC", "Parking", "Catering", "Valet", "WiFi", "Stage"],
            cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
            images: [],
            is_featured: true,
            is_active: true,
            rating: 4.7,
            total_reviews: 156,
            created_at: "",
            updated_at: "",
          },
          {
            id: "6",
            vendor_id: "v6",
            name: "Bhabua Valley Lawns",
            slug: "bhabua-valley-lawns",
            description: "Sprawling lawns nestled in the scenic Kaimur hills",
            venue_type: "lawn" as const,
            city: "Bhabua",
            state: "Bihar",
            address: "Station Rd, Bhabua",
            pincode: "821101",
            latitude: null,
            longitude: null,
            capacity_min: 100,
            capacity_max: 1000,
            price_per_slot: 150000,
            price_per_plate: 500,
            amenities: ["Lawn", "Parking", "Mandap Setup", "Hawan Kund", "Generator Backup"],
            cover_image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
            images: [],
            is_featured: true,
            is_active: true,
            rating: 4.4,
            total_reviews: 38,
            created_at: "",
            updated_at: "",
          },
        ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wider">
                Handpicked for You
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)]">
              Featured <span className="text-gradient-gold">Venues</span>
            </h2>
          </div>
          <Link href="/venues" className="hidden sm:block">
            <Button variant="outline">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVenues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/venues">
            <Button variant="outline">
              View All Venues <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
