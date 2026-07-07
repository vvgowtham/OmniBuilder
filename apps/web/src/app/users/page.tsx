'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User { id: string; email: string; fullName: string; status: string; createdAt: string; lastLoginAt?: string; }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try { setUsers(await api.getUsers(search || undefined)); } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [search]);

  const handleCreate = async () => {
    if (!form.email || !form.fullName || !form.password) return;
    setCreating(true);
    try {
      await api.createUser(form);
      setForm({ fullName: '', email: '', password: '' });
      setShowCreate(false);
      await loadUsers();
    } catch (e: any) { alert(e.message); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await api.deleteUser(id); await loadUsers(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-gray-500 text-sm">Manage user accounts</p></div>
        <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add User</button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Full Name" className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
            <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password" type="password" className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} disabled={creating} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{creating ? 'Creating...' : 'Create User'}</button>
            <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="h-9 w-64 rounded-lg border border-gray-200 px-3 text-sm mb-4 focus:border-purple-500 focus:outline-none" />

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : users.length === 0 ? <div className="p-8 text-center text-gray-400">No users found</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-sm">{u.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">{u.status}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><button onClick={() => handleDelete(u.id)} className="text-xs text-red-600 font-semibold">Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
