'use client';

import { useState } from 'react';
import LayoutShell from '../components/layout-shell';
import { CATEGORIES, BNode, cloneNode } from '../visual-builder/components';

export default function ComponentsPage() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string|null>(null);
  const [savedComponents, setSavedComponents] = useState<Array<{name:string;nodes:BNode[]}>>(()=>{
    if(typeof window!=='undefined'){const s=localStorage.getItem('saved-components');if(s)try{return JSON.parse(s)}catch{}}
    return [];
  });

  const allComps = Object.entries(CATEGORIES).flatMap(([cat, comps]) => comps.map(c => ({...c, category: cat})));
  const filtered = allComps.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCat && c.category !== selectedCat) return false;
    return true;
  });

  const addToBuilder = (nodes: BNode[]) => {
    const existing = JSON.parse(localStorage.getItem('builder-nodes') || '[]');
    const cloned = nodes.map(cloneNode);
    localStorage.setItem('builder-nodes', JSON.stringify([...existing, ...cloned]));
    alert('Added to builder! Open Visual Builder to see it.');
  };

  const saveAsReusable = (name: string, nodes: BNode[]) => {
    const updated = [...savedComponents, {name, nodes}];
    setSavedComponents(updated);
    localStorage.setItem('saved-components', JSON.stringify(updated));
  };

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-xl font-bold text-gray-900">Components</h1><p className="text-gray-500 text-xs">{allComps.length} components available</p></div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search components..." className="h-8 w-52 rounded-lg border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" />
          <button onClick={() => setSelectedCat(null)} className={`h-8 px-2.5 rounded-lg text-[10px] font-semibold ${!selectedCat ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600'}`}>All</button>
          {Object.keys(CATEGORIES).map(cat => (
            <button key={cat} onClick={() => setSelectedCat(cat)} className={`h-8 px-2.5 rounded-lg text-[10px] font-semibold ${selectedCat === cat ? 'bg-purple-600 text-white' : 'border border-gray-200 text-gray-600'}`}>{cat}</button>
          ))}
        </div>

        {/* Saved Components */}
        {savedComponents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">My Saved Components</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {savedComponents.map((c, i) => (
                <div key={i} className="bg-white border border-purple-200 rounded-lg p-3 text-center">
                  <div className="text-[10px] font-semibold text-purple-700">{c.name}</div>
                  <button onClick={() => addToBuilder(c.nodes)} className="mt-1 text-[9px] text-purple-600 font-semibold">Use</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Components */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c, i) => (
            <div key={c.name + i} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-semibold text-gray-400 uppercase">{c.category}</span>
              </div>
              <div className="font-semibold text-sm text-gray-900 mb-2">{c.name}</div>
              <div className="h-20 bg-gray-50 rounded-lg border border-gray-100 mb-3 flex items-center justify-center text-gray-300 text-xs">Preview</div>
              <div className="flex gap-1.5">
                <button onClick={() => addToBuilder(c.nodes)} className="flex-1 h-7 rounded-lg bg-purple-600 text-white text-[10px] font-semibold">Add to Page</button>
                <button onClick={() => saveAsReusable(c.name, c.nodes)} className="h-7 px-2 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-600">Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
