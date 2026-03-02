export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Platform configuration</p>
      </div>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <p className="text-gray-500">Admin settings will be available once connected to Supabase.</p>
      </div>
    </div>
  );
}
