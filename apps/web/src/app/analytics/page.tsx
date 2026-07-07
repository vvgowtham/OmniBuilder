'use client';
export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {[{l:'Page Views',v:'12,458'},{l:'Visitors',v:'32,745'},{l:'Bounce Rate',v:'35.8%'},{l:'Avg. Session',v:'3m 24s'}].map(s => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-2xl p-4"><div className="text-gray-500 text-xs mb-1">{s.l}</div><div className="text-xl font-extrabold text-gray-900">{s.v}</div></div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="font-bold text-gray-900 mb-4">Traffic Overview</h3>
        <div className="h-48 rounded-xl bg-gradient-to-t from-purple-50 to-transparent border border-gray-100 flex items-end p-4 gap-1">
          {[45,62,38,75,55,82,68,90,72,58,85,78,65,88,70,55,92,80,67,74,60,83,77,69,86,73,58,91,84,76].map((h,i) => (
            <div key={i} className="flex-1 bg-purple-500 rounded-t" style={{height: h+'%'}} />
          ))}
        </div>
      </div>
    </div>
  );
}
