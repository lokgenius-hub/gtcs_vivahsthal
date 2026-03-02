import { getVenues } from "@/lib/actions";
import { VenueCard } from "@/components/venue/venue-card";
import type { VenueType, VenueSearchParams } from "@/lib/types";

// Demo data for when DB is empty
const demoVenues = [
  {
    id: "1", vendor_id: "v1", name: "Royal Palace Banquet Hall", slug: "royal-palace-banquet",
    description: "An opulent banquet hall with regal architecture", venue_type: "banquet_hall" as VenueType,
    city: "Patna", state: "Bihar", address: "Exhibition Rd, Patna", pincode: "800001",
    latitude: null, longitude: null, capacity_min: 100, capacity_max: 800, price_per_slot: 250000,
    price_per_plate: 800, amenities: ["AC", "Parking", "Catering", "DJ/Music", "Decoration"],
    cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
    images: [], is_featured: true, is_active: true, rating: 4.8, total_reviews: 124, created_at: "", updated_at: "",
  },
  {
    id: "2", vendor_id: "v2", name: "Garden Paradise Resort", slug: "garden-paradise-resort",
    description: "Beautiful garden and lawns for outdoor celebrations", venue_type: "resort" as VenueType,
    city: "Gaya", state: "Bihar", address: "NH 83, Gaya", pincode: "823001",
    latitude: null, longitude: null, capacity_min: 200, capacity_max: 1200, price_per_slot: 400000,
    price_per_plate: 1200, amenities: ["Lawn", "Parking", "Catering", "Swimming Pool", "Bridal Suite"],
    cover_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    images: [], is_featured: true, is_active: true, rating: 4.6, total_reviews: 89, created_at: "", updated_at: "",
  },
  {
    id: "3", vendor_id: "v3", name: "Heritage Haveli", slug: "heritage-haveli",
    description: "A centuries-old haveli reimagined for grand celebrations", venue_type: "heritage" as VenueType,
    city: "Muzaffarpur", state: "Bihar", address: "Club Rd, Muzaffarpur", pincode: "842001",
    latitude: null, longitude: null, capacity_min: 50, capacity_max: 500, price_per_slot: 350000,
    price_per_plate: 1000, amenities: ["AC", "Parking", "Hawan Kund", "Mandap Setup", "Stage"],
    cover_image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80",
    images: [], is_featured: true, is_active: true, rating: 4.9, total_reviews: 67, created_at: "", updated_at: "",
  },
  {
    id: "4", vendor_id: "v4", name: "Lakeside Farmhouse", slug: "lakeside-farmhouse",
    description: "A serene lakeside farmhouse setting", venue_type: "farmhouse" as VenueType,
    city: "Bhagalpur", state: "Bihar", address: "Tilka Manjhi Rd, Bhagalpur", pincode: "812001",
    latitude: null, longitude: null, capacity_min: 100, capacity_max: 600, price_per_slot: 180000,
    price_per_plate: 600, amenities: ["Lawn", "Parking", "Kitchen", "Generator Backup"],
    cover_image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
    images: [], is_featured: true, is_active: true, rating: 4.5, total_reviews: 42, created_at: "", updated_at: "",
  },
  {
    id: "5", vendor_id: "v5", name: "Grand Convention Center", slug: "grand-convention-center",
    description: "Massive convention center", venue_type: "convention_center" as VenueType,
    city: "Patna", state: "Bihar", address: "Boring Rd, Patna", pincode: "800001",
    latitude: null, longitude: null, capacity_min: 300, capacity_max: 2000, price_per_slot: 500000,
    price_per_plate: 1500, amenities: ["AC", "Parking", "Catering", "Valet", "WiFi"],
    cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
    images: [], is_featured: true, is_active: true, rating: 4.7, total_reviews: 156, created_at: "", updated_at: "",
  },
  {
    id: "6", vendor_id: "v6", name: "Bhabua Valley Lawns", slug: "bhabua-valley-lawns",
    description: "Scenic lawns in Kaimur hills", venue_type: "lawn" as VenueType,
    city: "Bhabua", state: "Bihar", address: "Station Rd, Bhabua", pincode: "821101",
    latitude: null, longitude: null, capacity_min: 100, capacity_max: 1000, price_per_slot: 150000,
    price_per_plate: 500, amenities: ["Lawn", "Parking", "Mandap Setup", "Hawan Kund"],
    cover_image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
    images: [], is_featured: true, is_active: true, rating: 4.4, total_reviews: 38, created_at: "", updated_at: "",
  },
];

export async function VenueListings({
  searchParams = {},
}: {
  searchParams?: Record<string, string>;
}) {
  // Map URL params to VenueSearchParams
  const venueParams: VenueSearchParams = {
    city: searchParams.city,
    venue_type: searchParams.type as VenueType | undefined,
    capacity: searchParams.capacity ? Number(searchParams.capacity) : undefined,
    q: searchParams.q,
  };

  const { venues } = await getVenues(venueParams);

  // Filter demo venues by the same params so they reflect the search
  let filteredDemo = demoVenues;
  if (searchParams.city) {
    filteredDemo = filteredDemo.filter(
      (v) => v.city.toLowerCase() === searchParams.city.toLowerCase()
    );
  }
  if (searchParams.type) {
    filteredDemo = filteredDemo.filter((v) => v.venue_type === searchParams.type);
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filteredDemo = filteredDemo.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
  }

  const displayVenues = venues.length > 0 ? venues : filteredDemo;
  const activeFilter = searchParams.city || searchParams.type || searchParams.q;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {activeFilter ? (
            <>
              Showing <span className="font-medium text-gray-800">{displayVenues.length}</span> venues
              {searchParams.city && <> in <span className="font-medium text-gray-800">{searchParams.city}</span></>}
            </>
          ) : (
            <>
              Showing <span className="font-medium text-gray-800">{displayVenues.length}</span> venues
            </>
          )}
        </p>
      </div>

      {displayVenues.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-gray-500 mb-2">No venues found{searchParams.city ? ` in ${searchParams.city}` : ""}</p>
          <p className="text-sm text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVenues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
