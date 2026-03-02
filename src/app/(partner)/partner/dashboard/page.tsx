import { redirect } from "next/navigation";

// Redirect /partner/dashboard → /partner/venues
// Partners should land directly on their venue management page
export default function PartnerDashboard() {
  redirect("/partner/venues");
}
