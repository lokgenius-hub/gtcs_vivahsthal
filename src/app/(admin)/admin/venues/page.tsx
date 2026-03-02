export default function AdminVenuesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">All Venues</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage all venue listings</p>
      </div>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <p className="text-gray-500">Venue management will populate once connected to Supabase.</p>
      </div>
    </div>
  );
}
