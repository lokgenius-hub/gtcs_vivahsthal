export default function PartnerSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-charcoal)]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <p className="text-gray-500 text-sm">
          Profile settings will be available after connecting to Supabase. Configure your
          <code className="mx-1 px-1.5 py-0.5 bg-gray-100 rounded text-xs">.env.local</code>
          with your Supabase credentials to activate full functionality.
        </p>
      </div>
    </div>
  );
}
