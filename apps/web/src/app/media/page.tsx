'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import LayoutShell from '../components/layout-shell';

interface MediaAsset { id: string; fileName: string; mimeType: string; sizeBytes: number; createdAt: string; }

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => { setLoading(true); try { setAssets(await api.getMedia()); } catch { setAssets([]); } setLoading(false); };
  useEffect(() => { load(); }, []);

  const upload = async (files: FileList|null) => {
    if (!files) return; setUploading(true);
    for (const file of Array.from(files)) { const fd = new FormData(); fd.append('file', file); await api.uploadMedia(fd).catch(() => {}); }
    await load(); setUploading(false);
  };

  const del = async (id: string) => { if (!confirm('Delete?')) return; await api.deleteMedia(id).catch(() => {}); await load(); };

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div><h1 className="text-xl font-bold text-gray-900">Media Library</h1><p className="text-gray-500 text-xs">{assets.length} files</p></div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold disabled:opacity-50">{uploading ? 'Uploading...' : '+ Upload'}</button>
          <input ref={fileRef} type="file" multiple hidden onChange={e => upload(e.target.files)} />
        </div>
        <div className={`border-2 border-dashed rounded-xl p-6 mb-4 text-center text-sm transition-all ${dragOver?'border-purple-500 bg-purple-50':'border-gray-300 bg-white'}`} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);upload(e.dataTransfer.files)}}>{dragOver?'Drop here':'Drag files here or click Upload'}</div>
        {loading?<p className="text-center text-gray-400">Loading...</p>:assets.length===0?<p className="text-center text-gray-400">No files</p>:(
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">{assets.map(a=>(<div key={a.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group relative"><div className="aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-400">{a.mimeType.split('/')[1]?.toUpperCase()||'FILE'}</div><div className="p-1.5"><div className="text-[9px] font-medium truncate">{a.fileName}</div></div><button onClick={()=>del(a.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] opacity-0 group-hover:opacity-100 flex items-center justify-center">x</button></div>))}</div>
        )}
      </div>
    </LayoutShell>
  );
}
