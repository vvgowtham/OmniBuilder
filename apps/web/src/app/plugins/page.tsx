'use client';
const plugins = [{n:'Contact Form Pro',v:'2.4.1',s:'Active'},{n:'SEO Optimizer',v:'3.1.0',s:'Active'},{n:'WooCommerce Bridge',v:'1.8.2',s:'Active'},{n:'Image Optimizer',v:'2.0.3',s:'Active'},{n:'Social Share',v:'1.5.0',s:'Inactive'},{n:'SMTP Mailer',v:'1.2.1',s:'Active'}];
export default function PluginsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Plugins / Addons</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Install Plugin</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plugin</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Version</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead>
        <tbody>{plugins.map(p => (<tr key={p.n} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{p.n}</td><td className="px-4 py-3 text-sm text-gray-500">{p.v}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.s==='Active'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>{p.s}</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
