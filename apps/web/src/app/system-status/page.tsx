'use client';
export default function SystemStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Status</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        {[{l:'Uptime',v:'99.9%',c:'text-green-600'},{l:'Response Time',v:'142ms',c:''},{l:'CPU Usage',v:'23%',c:''},{l:'Memory',v:'1.2 GB',c:''}].map(s => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-2xl p-4"><div className="text-gray-500 text-xs mb-1">{s.l}</div><div className={`text-xl font-extrabold ${s.c||'text-gray-900'}`}>{s.v}</div></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">Server Information</h3>
          {[['OS','Ubuntu 22.04 LTS'],['Web Server','Nginx 1.24'],['PHP','8.2.10'],['Node.js','22.4.0'],['Database','MySQL 8.0.35'],['Redis','7.2.1'],['SSL','Valid (Dec 2026)']].map(([k,v]) => (<div key={k} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm"><span className="text-gray-500">{k}</span><span className="text-gray-900">{v}</span></div>))}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">Application</h3>
          {[['OmniBuilder Version','2.4.1'],['Last Updated','Jul 5, 2026'],['Cron Jobs','Running'],['Queue Workers','Active (3)'],['Cache','Redis Connected'],['Storage','2.45 GB / 10 GB']].map(([k,v]) => (<div key={k} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm"><span className="text-gray-500">{k}</span><span className={v?.includes('Active')||v?.includes('Running')||v?.includes('Connected')?'text-green-600 font-semibold':'text-gray-900'}>{v}</span></div>))}
        </div>
      </div>
    </div>
  );
}
