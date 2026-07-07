'use client';
export default function SEOPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">SEO Tools</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[{l:'SEO Score',v:'85/100',c:'text-green-600'},{l:'Meta Tags',v:'Complete',c:''},{l:'Sitemap',v:'Generated',c:'text-green-600'},{l:'Broken Links',v:'3',c:'text-red-600'},{l:'Issues',v:'5',c:'text-orange-500'},{l:'Readability',v:'Good',c:'text-green-600'}].map(s => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-2xl p-4"><div className="text-gray-500 text-xs mb-1">{s.l}</div><div className={`text-xl font-extrabold ${s.c || 'text-gray-900'}`}>{s.v}</div></div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">SEO Checklist</h3>
        {[['All pages have meta titles','Pass','green'],['All pages have meta descriptions','Pass','green'],['XML Sitemap generated','Pass','green'],['3 broken links detected','Fix','red'],['5 images missing alt text','Warning','orange']].map(([t,s,c]) => (
          <div key={t} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-700">{t}</span>
            <span className={`text-xs font-semibold text-${c}-600`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
