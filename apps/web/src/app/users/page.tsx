'use client';
const users = [{n:'John Doe',e:'john@example.com',r:'Administrator'},{n:'Alex Johnson',e:'alex@example.com',r:'Editor'},{n:'Sarah Williams',e:'sarah@example.com',r:'Author'},{n:'Mark Collins',e:'mark@example.com',r:'Contributor'},{n:'Ella Bennett',e:'ella@example.com',r:'Subscriber'}];
export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-gray-500 text-sm">Manage user accounts</p></div>
        <button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add New User</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead>
        <tbody>{users.map(u => (<tr key={u.e} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{u.n}</td><td className="px-4 py-3 text-sm text-gray-500">{u.e}</td><td className="px-4 py-3 text-sm">{u.r}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">Active</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
