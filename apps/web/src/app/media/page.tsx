'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';

interface MediaAsset { id: string; fileName: string; mimeType: string; sizeBytes: number; storageKey: string; createdAt: string; altText?: string; }

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadAssets = async () => {
    setLoading(true);
    try { setAssets(await api.getMedia()); } catch { setAssets([]); }
    setLoading(false);
  };

  useEffect(() => { loadAssets(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try { await api.uploadMedia(formData); } catch (e: any) { alert(`Upload failed: ${e.message}`); }
    }
    await loadAssets();
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    await api.deleteMedia(id).catch(() => {});
    await loadAssets();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Media Library</h1><p className="text-gray-500 text-sm">{assets.length} files</p></div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{uploading ? 'Uploading...' : '+ Upload Files'}</button>
        <input ref={fileRef} type="file" multiple hidden onChange={e => handleUpload(e.target.files)} />
      </div>

      <div className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'}`} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}>
        <p className="text-gray-500 text-sm">{dragOver ? 'Drop files here' : 'Drag and drop files here, or click Upload'}</p>
      </div>

      {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> : assets.length === 0 ? <div className="text-center text-gray-400 py-12">No media files. Upload your first file!</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {assets.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-400 relative">
                {a.mimeType.startsWith('image/') ? <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-2xl">\uD83D\uDDBC</div> : <span>{a.mimeType.split('/')[1]?.toUpperCase()}</span>}
                <button onClick={() => handleDelete(a.id)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">\u00D7</button>
              </div>
              <div className="p-2">
                <div className="text-xs font-medium text-gray-900 truncate">{a.fileName}</div>
                <div className="text-[10px] text-gray-400">{formatSize(a.sizeBytes)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
