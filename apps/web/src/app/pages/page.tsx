'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Page { id: string; title: string; slug: string; status: string; pageType: string; updatedAt: string; seoTitle?: string; seoDesc?: string; }

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'published'|'draft'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') : null;

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await api.getPages(projectId || undefined);
      setPages(data);
    } catch {
      setPages([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadPages(); }, []);

  const filteredPages = pages.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.createPage({ title: newTitle, projectId: projectId || undefined });
      setNewTitle('');
      setShowCreate(false);
      await loadPages();
    } catch (e: any) { alert(e.message); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try { await api.deletePage(id); await loadPages(); } catch (e: any) { alert(e.message); }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} pages?`)) return;
    for (const id of selected) { await api.deletePage(id).catch(() => {}); }
    setSelected(new Set());
    await loadPages();
  };

  const handlePublish = async (id: string) => {
    await api.publishPage(id).catch(() => {});
    await loadPages();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pages</h1><p className="text-gray-500 text-sm">Manage website pages</p></div>
        <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Create Page</button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">New Page</h3>
          <div className="flex gap-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Page title" className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <button onClick={handleCreate} disabled={creating} className="h-10 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="h-10 px-4 rounded-lg border border-gray-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..." className="h-9 w-64 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
        <div className="flex gap-1">
          {(['all','published','draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`h-9 px-3 rounded-lg text-xs font-semibold capitalize ${filter === f ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600'}`}>{f} ({f === 'all' ? pages.length : pages.filter(p => p.status === f).length})</button>
          ))}
        </div>
        {selected.size > 0 && <button onClick={handleBulkDelete} className="h-9 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold">Delete {selected.size}</button>}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : filteredPages.length === 0 ? <div className="p-8 text-center text-gray-400">No pages found. Create your first page!</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-gray-100"><th className="w-10 px-4 py-3"><input type="checkbox" onChange={e => { if (e.target.checked) setSelected(new Set(filteredPages.map(p=>p.id))); else setSelected(new Set()); }} /></th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Updated</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>{filteredPages.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                <td className="px-4 py-3 font-medium text-sm text-gray-900">{p.title}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href="/visual-builder" className="text-xs text-purple-600 font-semibold">Edit</Link>
                  {p.status === 'draft' && <button onClick={() => handlePublish(p.id)} className="text-xs text-green-600 font-semibold">Publish</button>}
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 font-semibold">Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
