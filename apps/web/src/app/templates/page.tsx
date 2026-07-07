'use client';
const templates = ['Landing Page','About Page','Service Page','Pricing Page','Contact Page','Blog Layout','Portfolio Layout','Team Layout'];
export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900">Templates</h1><p className="text-gray-500 text-sm">Manage reusable page templates</p></div><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Import Template</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {templates.map(t => (<div key={t} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"><div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200" /><div className="p-3"><div className="font-semibold text-sm">{t}</div><div className="text-xs text-green-600">Available</div></div></div>))}
        </div>
      </div>
    </div>
  );
}
