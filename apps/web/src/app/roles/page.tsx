'use client';
export default function RolesPage() {
  const roles = [['Administrator',1,'Full Access'],['Editor',2,'Edit & Publish'],['Author',1,'Create & Edit Own'],['Contributor',1,'Create Only'],['Subscriber',1,'View Only']];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add Role</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Users</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Permissions</th></tr></thead>
        <tbody>{roles.map(([r,u,p]) => (<tr key={r as string} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{r}</td><td className="px-4 py-3 text-sm">{u}</td><td className="px-4 py-3 text-sm text-gray-500">{p}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
