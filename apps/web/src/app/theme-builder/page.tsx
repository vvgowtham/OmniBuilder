'use client';
export default function ThemeBuilderPage() {
  const templates = [['Header','Header','Default'],['Footer','Footer','Default'],['Single Post','Post Template','Default'],['Single Page','Page Template','Default'],['Archive','Archive','Default'],['Search Results','Search','Default'],['404 Page','Error','Default']];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Theme Builder</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add New</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Template</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead>
        <tbody>{templates.map(([n,t,s]) => (<tr key={n} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{n}</td><td className="px-4 py-3 text-sm text-gray-500">{t}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">{s}</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
