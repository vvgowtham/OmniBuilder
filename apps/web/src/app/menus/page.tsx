'use client';

import { useState, useEffect } from 'react';
import LayoutShell from '../components/layout-shell';

interface MenuItem { id: string; label: string; url: string; children: MenuItem[]; }
interface Menu { id: string; name: string; location: string; items: MenuItem[]; }

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('omni-menus');
      if (s) try { return JSON.parse(s); } catch {}
    }
    return [{ id: 'm1', name: 'Main Menu', location: 'primary', items: [
      { id: 'i1', label: 'Home', url: '/', children: [] },
      { id: 'i2', label: 'About', url: '/about', children: [] },
      { id: 'i3', label: 'Services', url: '/services', children: [{ id: 'i3a', label: 'Web Design', url: '/services/web', children: [] }, { id: 'i3b', label: 'Development', url: '/services/dev', children: [] }] },
      { id: 'i4', label: 'Contact', url: '/contact', children: [] },
    ]}, { id: 'm2', name: 'Footer Menu', location: 'footer', items: [
      { id: 'f1', label: 'Privacy', url: '/privacy', children: [] },
      { id: 'f2', label: 'Terms', url: '/terms', children: [] },
    ]}];
  });
  const [activeMenu, setActiveMenu] = useState<string>('m1');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('/');
  const [showCreate, setShowCreate] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  const save = (m: Menu[]) => { setMenus(m); localStorage.setItem('omni-menus', JSON.stringify(m)); };

  const menu = menus.find(m => m.id === activeMenu);

  const addItem = () => {
    if (!newLabel.trim() || !menu) return;
    const item: MenuItem = { id: 'i' + Date.now(), label: newLabel, url: newUrl, children: [] };
    save(menus.map(m => m.id === activeMenu ? {...m, items: [...m.items, item]} : m));
    setNewLabel(''); setNewUrl('/');
  };

  const deleteItem = (itemId: string) => {
    const removeItem = (items: MenuItem[]): MenuItem[] => items.filter(i => i.id !== itemId).map(i => ({...i, children: removeItem(i.children)}));
    save(menus.map(m => m.id === activeMenu ? {...m, items: removeItem(m.items)} : m));
  };

  const moveItem = (itemId: string, dir: -1|1) => {
    if (!menu) return;
    const items = [...menu.items];
    const i = items.findIndex(x => x.id === itemId);
    const ni = i + dir;
    if (ni < 0 || ni >= items.length) return;
    [items[i], items[ni]] = [items[ni], items[i]];
    save(menus.map(m => m.id === activeMenu ? {...m, items} : m));
  };

  const createMenu = () => {
    if (!newMenuName.trim()) return;
    const m: Menu = { id: 'm' + Date.now(), name: newMenuName, location: 'custom', items: [] };
    save([...menus, m]);
    setActiveMenu(m.id);
    setNewMenuName(''); setShowCreate(false);
  };

  const deleteMenu = (id: string) => {
    if (!confirm('Delete this menu?')) return;
    const updated = menus.filter(m => m.id !== id);
    save(updated);
    if (activeMenu === id) setActiveMenu(updated[0]?.id || '');
  };

  const renderItem = (item: MenuItem, depth: number) => (
    <div key={item.id} style={{marginLeft: depth * 20 + 'px'}}>
      <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg mb-1 bg-white group">
        <span className="text-gray-400 cursor-grab text-xs">&#9776;</span>
        <span className="flex-1 text-sm font-medium">{item.label}</span>
        <span className="text-xs text-gray-400">{item.url}</span>
        <div className="hidden group-hover:flex gap-1">
          <button onClick={() => moveItem(item.id, -1)} className="w-5 h-5 rounded bg-gray-100 text-[9px] flex items-center justify-center">^</button>
          <button onClick={() => moveItem(item.id, 1)} className="w-5 h-5 rounded bg-gray-100 text-[9px] flex items-center justify-center">v</button>
          <button onClick={() => deleteItem(item.id)} className="w-5 h-5 rounded bg-red-50 text-red-600 text-[9px] flex items-center justify-center">x</button>
        </div>
      </div>
      {item.children.map(c => renderItem(c, depth + 1))}
    </div>
  );

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-xl font-bold text-gray-900">Menus</h1><p className="text-gray-500 text-xs">Manage navigation menus</p></div>
          <button onClick={() => setShowCreate(true)} className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">+ New Menu</button>
        </div>

        {showCreate && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex gap-2">
            <input value={newMenuName} onChange={e => setNewMenuName(e.target.value)} placeholder="Menu name" className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
            <button onClick={createMenu} className="h-9 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">Create</button>
            <button onClick={() => setShowCreate(false)} className="h-9 px-3 rounded-lg border border-gray-200 text-xs">Cancel</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
          {/* Menu list */}
          <div className="space-y-1">
            {menus.map(m => (
              <div key={m.id} onClick={() => setActiveMenu(m.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${activeMenu === m.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}>
                <div className="flex justify-between">
                  <div className="font-semibold text-sm">{m.name}</div>
                  <button onClick={e => { e.stopPropagation(); deleteMenu(m.id); }} className="text-[10px] text-red-500">x</button>
                </div>
                <div className="text-[10px] text-gray-500">{m.location} - {m.items.length} items</div>
              </div>
            ))}
          </div>

          {/* Menu editor */}
          {menu && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">{menu.name}</h3>
              <div className="space-y-0.5 mb-4">
                {menu.items.length > 0 ? menu.items.map(item => renderItem(item, 0)) : <p className="text-sm text-gray-400">No items. Add one below.</p>}
              </div>
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label" className="flex-1 h-8 rounded-lg border border-gray-200 px-2 text-sm focus:border-purple-500 focus:outline-none" />
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" className="w-28 h-8 rounded-lg border border-gray-200 px-2 text-sm focus:border-purple-500 focus:outline-none" />
                <button onClick={addItem} className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">Add Item</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
