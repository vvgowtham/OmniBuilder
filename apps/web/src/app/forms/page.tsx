'use client';
export default function FormsPage() {
  const forms = [{n:'Contact Form',sc:'[form id=1]',en:44},{n:'Newsletter Signup',sc:'[form id=2]',en:120},{n:'Request a Quote',sc:'[form id=3]',en:32},{n:'Job Application',sc:'[form id=4]',en:18}];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Forms</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add New Form</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Shortcode</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entries</th></tr></thead>
        <tbody>{forms.map(f => (<tr key={f.n} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{f.n}</td><td className="px-4 py-3 text-sm text-gray-500"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{f.sc}</code></td><td className="px-4 py-3 text-sm">{f.en}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
