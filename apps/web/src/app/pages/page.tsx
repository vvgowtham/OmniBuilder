'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import LayoutShell from '../components/layout-shell';

interface Page { id: string; title: string; slug: string; status: string; updatedAt: string; }

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'published'|'draft'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadPages = async () => {
    setLoading(true);
    try { setPages(await api.getPages()); } catch { setPages([]); }
    setLoading(false);
  };

  useEffect(() => { loadPages(); }, []);

  const filtered = pages.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try { await api.createPage({ title: newTitle }); setNewTitle(''); setShowCreate(false); await loadPages(); } catch (e: any) { alert(e.message); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.deletePage(id); await loadPages(); } catch {}
  };

  const handlePublish = async (id: string) => { try { await api.publishPage(id); await loadPages(); } catch {} };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} pages?`)) return;
    for (const id of selected) await api.deletePage(id).catch(() => {});
    setSelected(new Set()); await loadPages();
  };

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-xl font-bold text-gray-900">Pages</h1><p className="text-gray-500 text-xs">Manage website pages</p></div>
          <button onClick={() => setShowCreate(true)} className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">+ New Page</button>
        </div>

        {showCreate && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-2">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Page title" className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <button onClick={handleCreate} disabled={creating} className="h-9 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold disabled:opacity-50">{creating ? '...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="h-9 px-3 rounded-lg border border-gray-200 text-xs">Cancel</button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="h-8 w-48 rounded-lg border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" />
          {(['all','published','draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`h-8 px-2.5 rounded-lg text-[10px] font-semibold capitalize ${filter === f ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600'}`}>{f}</button>
          ))}
          {selected.size > 0 && <button onClick={handleBulkDelete} className="h-8 px-2.5 rounded-lg bg-red-600 text-white text-[10px] font-semibold">Delete ({selected.size})</button>}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? <div className="p-6 text-center text-gray-400 text-sm">Loading...</div> : filtered.length === 0 ? <div className="p-6 text-center text-gray-400 text-sm">No pages found</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-gray-100"><th className="w-8 px-3 py-2"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(p=>p.id)) : new Set())} /></th><th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Title</th><th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Status</th><th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Updated</th><th className="px-3 py-2"></th></tr></thead>
              <tbody>{filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2"><input type="checkbox" checked={selected.has(p.id)} onChange={() => { const s = new Set(selected); s.has(p.id)?s.delete(p.id):s.add(p.id); setSelected(s); }} /></td>
                  <td className="px-3 py-2 text-sm font-medium">{p.title}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.status==='published'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                  <td className="px-3 py-2 text-xs text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2 flex gap-1.5">
                    <Link href="/visual-builder" className="text-[10px] text-purple-600 font-semibold">Edit</Link>
                    {p.status==='draft'&&<button onClick={()=>handlePublish(p.id)} className="text-[10px] text-green-600 font-semibold">Publish</button>}
                    <button onClick={()=>handleDelete(p.id)} className="text-[10px] text-red-600 font-semibold">Del</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
