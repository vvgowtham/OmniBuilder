'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LayoutShell from '../components/layout-shell';

interface Website {
  id: string;
  name: string;
  source: string;
  createdAt: string;
  pages: Array<{name:string;slug:string;html:string}>;
  media?: Array<any>;
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [viewingHtml, setViewingHtml] = useState<string | null>(null);
  const [viewingName, setViewingName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('imported-projects');
    if (saved) try { setWebsites(JSON.parse(saved)); } catch {}
  }, []);

  const viewLive = (site: Website) => {
    // Find the home/index page
    const homePage = site.pages.find(p => p.slug === 'home' || p.slug === 'index') || site.pages[0];
    if (homePage) {
      setViewingHtml(homePage.html);
      setViewingName(site.name + ' - ' + homePage.name);
    }
  };

  const deleteWebsite = (id: string) => {
    if (!confirm('Delete this website?')) return;
    const updated = websites.filter(w => w.id !== id);
    setWebsites(updated);
    localStorage.setItem('imported-projects', JSON.stringify(updated));
  };

  // Live preview modal
  if (viewingHtml) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="h-10 bg-gray-900 flex items-center justify-between px-4 shrink-0">
          <span className="text-white text-xs font-medium">{viewingName}</span>
          <button onClick={() => setViewingHtml(null)} className="text-white text-xs bg-red-600 px-3 py-1 rounded">Close Preview</button>
        </div>
        <iframe srcDoc={viewingHtml} className="flex-1 w-full border-0" sandbox="allow-same-origin allow-scripts" />
      </div>
    );
  }

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Website List</h1>
            <p className="text-gray-500 text-xs">All imported and created websites</p>
          </div>
          <Link href="/import" className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold flex items-center">+ Import Website</Link>
        </div>

        {websites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-3">No websites yet</p>
            <Link href="/import" className="text-sm text-purple-600 font-semibold">Import your first website</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites.map(site => (
              <div key={site.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                {/* Preview thumbnail */}
                <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 flex items-center justify-center relative">
                  <span className="text-gray-300 text-sm">Website Preview</span>
                  <button onClick={() => viewLive(site)} className="absolute top-2 right-2 text-[10px] bg-purple-600 text-white px-2 py-1 rounded font-semibold hover:bg-purple-700">View Live</button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{site.name}</h3>
                  <div className="text-xs text-gray-500 mb-3">
                    {site.pages ? site.pages.length : 0} pages | {site.media ? site.media.length : 0} assets | {site.source}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(site.pages || []).slice(0, 5).map((pg, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{pg.name}</span>
                    ))}
                    {(site.pages || []).length > 5 && <span className="text-[9px] text-gray-400">+{site.pages.length - 5} more</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => viewLive(site)} className="flex-1 h-8 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-semibold hover:bg-purple-100">View Live</button>
                    <button onClick={() => { localStorage.setItem('active-project', site.id); router.push('/pages'); }} className="flex-1 h-8 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-semibold hover:bg-gray-200">Edit Pages</button>
                    <button onClick={() => deleteWebsite(site.id)} className="h-8 px-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-semibold hover:bg-red-100">Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
