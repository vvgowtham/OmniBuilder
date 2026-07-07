'use client';
export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Site Title</label><input defaultValue="TechCorp Official Website" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Tagline</label><input defaultValue="We build amazing digital experiences" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Site Email</label><input defaultValue="info@techcorp.com" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-600 mb-1">Timezone</label><select className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"><option>(UTC+05:30) IST</option></select></div>
        </div>
        <button className="mt-4 h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">Save Changes</button>
      </div>
    </div>
  );
}
