// ── Kaimur District (Bihar) locations ──────────────────────
// To add a new location: just append a new string to this array.
// Example: add "Ramgarh" → add `"Ramgarh",` at the end before `] as const;`
// See LOCATIONS_GUIDE.md for full instructions.
export const CITIES = [
  "Bhabua",     // District HQ
  "Mohania",
  "Chainpur",
  "Bhagwanpur",
  "Belaw",
  "Chenari",
  "Adhaura",
  "Ramgarh",
  "Kudra",
  "Nuaon",
  "Durgawati",
] as const;

export const VENUE_TYPES = [
  { value: "banquet_hall", label: "Banquet Hall" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "resort", label: "Resort" },
  { value: "hotel", label: "Hotel" },
  { value: "lawn", label: "Lawn / Garden" },
  { value: "temple", label: "Temple" },
  { value: "palace", label: "Palace" },
  { value: "heritage", label: "Heritage" },
  { value: "convention_center", label: "Convention Center" },
  { value: "community_hall", label: "Community Hall" },
] as const;

export const AMENITIES = [
  "AC",
  "Parking",
  "Catering",
  "DJ/Music",
  "Decoration",
  "Valet",
  "Bridal Suite",
  "Lawn",
  "Swimming Pool",
  "Generator Backup",
  "CCTV",
  "WiFi",
  "Kitchen",
  "Stage",
  "Hawan Kund",
  "Mandap Setup",
  "Photographer",
  "Videographer",
] as const;

export const SLOT_TYPES = [
  { value: "morning", label: "Morning (6AM - 2PM)" },
  { value: "evening", label: "Evening (4PM - 12AM)" },
  { value: "full_day", label: "Full Day" },
] as const;

export const BUDGET_RANGES = [
  { value: "0-100000", label: "Under ₹1 Lakh" },
  { value: "100000-300000", label: "₹1 - 3 Lakh" },
  { value: "300000-500000", label: "₹3 - 5 Lakh" },
  { value: "500000-1000000", label: "₹5 - 10 Lakh" },
  { value: "1000000-2500000", label: "₹10 - 25 Lakh" },
  { value: "2500000-99999999", label: "₹25 Lakh+" },
] as const;

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};
