'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Project { id: string; name: string; slug: string; status: string; description?: string; detectedFramework?: string; createdAt: string; _count?: { pages: number; mediaAssets: number; components: number }; }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('currentProjectId');
    if (id) setActiveId(id);
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try { setProjects(await api.getProjects()); } catch { setProjects([]); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const orgs = await api.getProjects();
      let orgId = orgs[0]?.organizationId;
      if (!orgId) orgId = 'default';
      const project = await api.createProject({ name, description: desc, organizationId: orgId });
      switchProject(project.id);
      setName(''); setDesc(''); setShowCreate(false);
      await loadProjects();
    } catch (e: any) { alert(e.message); }
    setCreating(false);
  };

  const switchProject = (id: string) => {
    localStorage.setItem('currentProjectId', id);
    setActiveId(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project and all its pages, media, and data?')) return;
    try { await api.deleteProject(id); if (activeId === id) { localStorage.removeItem('currentProjectId'); setActiveId(null); } await loadProjects(); } catch (e: any) { alert(e.message); }
  };

  const handleDuplicate = async (id: string) => {
    try { await api.duplicateProject(id); await loadProjects(); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Projects</h1><p className="text-gray-500 text-sm">Manage your websites</p></div>
        <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ New Project</button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Create Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} disabled={creating} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-12 text-center text-gray-400">Loading...</div> : projects.length === 0 ? <div className="py-12 text-center text-gray-400">No projects yet. Create your first!</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className={`bg-white border rounded-2xl p-5 transition-all ${activeId === p.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-purple-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                {activeId === p.id && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">ACTIVE</span>}
              </div>
              {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
              <div className="flex gap-3 text-xs text-gray-400 mb-4">
                <span>{p._count?.pages || 0} pages</span>
                <span>{p._count?.mediaAssets || 0} media</span>
                <span>{p.detectedFramework || 'Custom'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => switchProject(p.id)} className={`flex-1 h-8 rounded-lg text-xs font-semibold ${activeId === p.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-purple-50'}`}>{activeId === p.id ? 'Active' : 'Switch'}</button>
                <button onClick={() => handleDuplicate(p.id)} className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">Dup</button>
                <button onClick={() => handleDelete(p.id)} className="h-8 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
