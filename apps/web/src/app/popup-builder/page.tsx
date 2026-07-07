'use client';
export default function PopupBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Popup Builder</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Create Popup</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-xl overflow-hidden"><div className="h-32 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">Newsletter</div><div className="p-3"><div className="font-semibold text-sm">Newsletter Popup</div><div className="text-xs text-green-600">Active</div></div></div>
          <div className="border border-gray-200 rounded-xl overflow-hidden"><div className="h-32 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">20% OFF</div><div className="p-3"><div className="font-semibold text-sm">Exit Intent</div><div className="text-xs text-green-600">Active</div></div></div>
          <div className="border border-gray-200 rounded-xl overflow-hidden"><div className="h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">Cookie Banner</div><div className="p-3"><div className="font-semibold text-sm">Cookie Consent</div><div className="text-xs text-green-600">Active</div></div></div>
        </div>
      </div>
    </div>
  );
}
