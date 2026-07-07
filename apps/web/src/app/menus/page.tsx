'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface MenuItem { id: string; label: string; targetType: string; targetRef: string; sortOrder: number; children?: MenuItem[]; }
interface Menu { id: string; name: string; locationKey: string; items: MenuItem[]; }

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [location, setLocation] = useState('primary');
  const [creating, setCreating] = useState(false);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('/');

  const loadMenus = async () => {
    setLoading(true);
    try { const data = await api.getMenus(); setMenus(data); if (data.length > 0 && !activeMenu) setActiveMenu(data[0]); } catch { setMenus([]); }
    setLoading(false);
  };

  useEffect(() => { loadMenus(); }, []);

  const handleCreateMenu = async () => {
    if (!menuName.trim()) return;
    setCreating(true);
    try {
      const projectId = localStorage.getItem('currentProjectId') || 'default';
      await api.createMenu({ name: menuName, locationKey: location, projectId });
      setMenuName(''); setShowCreate(false);
      await loadMenus();
    } catch (e: any) { alert(e.message); }
    setCreating(false);
  };

  const handleAddItem = async () => {
    if (!activeMenu || !newLabel.trim()) return;
    try {
      await api.addMenuItem(activeMenu.id, { label: newLabel, targetType: 'url', targetRef: newUrl, sortOrder: activeMenu.items.length });
      setNewLabel(''); setNewUrl('/');
      await loadMenus();
      const updated = menus.find(m => m.id === activeMenu.id);
      if (updated) setActiveMenu(updated);
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Delete this menu?')) return;
    try { await api.deleteMenu(id); if (activeMenu?.id === id) setActiveMenu(null); await loadMenus(); } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Menus</h1><p className="text-gray-500 text-sm">Manage navigation menus</p></div>
        <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Create Menu</button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={menuName} onChange={e => setMenuName(e.target.value)} placeholder="Menu name" className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
            <select value={location} onChange={e => setLocation(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm"><option value="primary">Primary Navigation</option><option value="footer">Footer</option><option value="mobile">Mobile</option></select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreateMenu} disabled={creating} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        <div className="space-y-2">
          {loading ? <div className="text-gray-400 text-sm">Loading...</div> : menus.map(m => (
            <div key={m.id} onClick={() => setActiveMenu(m)} className={`p-3 rounded-xl border cursor-pointer transition-all ${activeMenu?.id === m.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}>
              <div className="flex justify-between items-center">
                <div><div className="font-semibold text-sm">{m.name}</div><div className="text-xs text-gray-500">{m.locationKey} &middot; {m.items?.length || 0} items</div></div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteMenu(m.id); }} className="text-xs text-red-500">&times;</button>
              </div>
            </div>
          ))}
        </div>

        {activeMenu && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">{activeMenu.name} - Items</h3>
            <div className="space-y-2 mb-4">
              {activeMenu.items?.length ? activeMenu.items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-400 cursor-grab">&#9776;</span>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.targetRef}</span>
                </div>
              )) : <p className="text-sm text-gray-400">No items yet</p>}
            </div>
            <div className="flex gap-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label" className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" className="w-32 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
              <button onClick={handleAddItem} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-xs font-semibold">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
