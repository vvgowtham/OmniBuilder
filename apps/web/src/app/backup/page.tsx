'use client';
export default function BackupPage() {
  const backups = [{d:'Jul 7, 2026 10:20 AM',sz:'103 MB'},{d:'Jul 5, 2026 11:30 PM',sz:'101 MB'},{d:'Jul 3, 2026 09:15 AM',sz:'99 MB'},{d:'Jun 30, 2026 06:40 AM',sz:'97 MB'}];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Create Backup</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
        <tbody>{backups.map(b => (<tr key={b.d} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 text-sm">{b.d}</td><td className="px-4 py-3 text-sm text-gray-500">{b.sz}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Complete</span></td><td className="px-4 py-3"><button className="text-xs text-purple-600 font-semibold">Restore</button></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
