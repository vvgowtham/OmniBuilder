'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import LayoutShell from '../components/layout-shell';

interface ImportedProject { id: string; name: string; pages: Array<{name:string;slug:string;html:string}>; media?: Array<any>; }

export default function PagesPage() {
  const [apiPages, setApiPages] = useState<any[]>([]);
  const [importedProjects, setImportedProjects] = useState<ImportedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const router = useRouter();

  useEffect(() => {
    api.getPages().then(setApiPages).catch(() => setApiPages([]));
    const saved = localStorage.getItem('imported-projects');
    if (saved) try { setImportedProjects(JSON.parse(saved)); } catch {}
    setLoading(false);
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try { await api.createPage({title: newTitle}); setNewTitle(''); setShowCreate(false); setApiPages(await api.getPages()); } catch {}
  };

  // Opens in YellowPencil-style iframe editor (preserves layout)
  const editImported = (page: {name:string;slug:string;html?:string}) => {
    localStorage.setItem('editing-page', JSON.stringify(page));
    router.push('/website-editor');
  };

  // Opens in drag-drop builder (for new pages)
  const editInBuilder = (page: {name:string;slug:string;html?:string}) => {
    localStorage.removeItem('builder-nodes');
    localStorage.setItem('editing-page', JSON.stringify(page));
    router.push('/visual-builder');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await api.deletePage(id); setApiPages(await api.getPages()); } catch {}
  };

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-xl font-bold text-gray-900">Pages</h1><p className="text-gray-500 text-xs">All pages across your projects</p></div>
          <button onClick={()=>setShowCreate(true)} className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">+ New Page</button>
        </div>

        {showCreate&&<div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-2"><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Page title" className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" onKeyDown={e=>e.key==='Enter'&&handleCreate()}/><button onClick={handleCreate} className="h-9 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">Create</button><button onClick={()=>setShowCreate(false)} className="h-9 px-3 rounded-lg border border-gray-200 text-xs">Cancel</button></div>}

        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pages..." className="h-8 w-64 rounded-lg border border-gray-200 px-2 text-xs mb-4 focus:border-purple-500 focus:outline-none"/>

        {/* Imported Websites */}
        {importedProjects.map(proj => {
          const filteredPages = (proj.pages || []).filter(p => !search || (p.name || '').toLowerCase().includes(search.toLowerCase()));
          if (filteredPages.length === 0 && search) return null;
          return (
            <div key={proj.id} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">W</div>
                <h3 className="text-sm font-bold text-gray-900">{proj.name}</h3>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{(proj.pages || []).length} pages</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {filteredPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-semibold">{i+1}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.name || 'Untitled'}</div>
                        <div className="text-[10px] text-gray-400">/{page.slug || ''}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>editImported(page)} className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg hover:bg-purple-100">Edit (Preserve Layout)</button>
                      <button onClick={()=>editInBuilder(page)} className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100">Open in Builder</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* API Pages */}
        {apiPages.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">N</div>
              <h3 className="text-sm font-bold text-gray-900">Created Pages</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {apiPages.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <div><div className="text-sm font-medium">{p.title}</div><div className="text-[10px] text-gray-400">/{p.slug}</div></div>
                  <div className="flex gap-2">
                    <button onClick={()=>editInBuilder({name:p.title,slug:p.slug})} className="text-[10px] text-purple-600 font-semibold">Edit</button>
                    <button onClick={()=>handleDelete(p.id)} className="text-[10px] text-red-600 font-semibold">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {importedProjects.length===0 && apiPages.length===0 && !loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-3">No pages yet</p>
            <Link href="/import" className="text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1.5 rounded-lg">Import a Website</Link>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
