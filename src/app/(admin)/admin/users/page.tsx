export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Users</h1>
        <p className="text-gray-500 text-sm mt-1">Manage customers, vendors, and RMs</p>
      </div>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <p className="text-gray-500">User management will populate once connected to Supabase.</p>
      </div>
    </div>
  );
}
