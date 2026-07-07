'use client';
export default function SlidersPage() {
  const sliders = [{n:'Home Slider',sc:'[slider id=1]',c:5},{n:'Testimonial Slider',sc:'[slider id=2]',c:4},{n:'Logo Slider',sc:'[slider id=3]',c:8},{n:'Product Slider',sc:'[slider id=4]',c:6}];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Sliders</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add New Slider</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Shortcode</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Slides</th></tr></thead>
        <tbody>{sliders.map(s => (<tr key={s.n} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{s.n}</td><td className="px-4 py-3 text-sm text-gray-500"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{s.sc}</code></td><td className="px-4 py-3 text-sm">{s.c}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
