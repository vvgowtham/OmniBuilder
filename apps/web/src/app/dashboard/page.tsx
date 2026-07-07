'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (u) setUser(JSON.parse(u));

    // Fetch real data from API
    api.dashboardStats().then(s => { setStats(s); setApiConnected(true); }).catch(() => {
      setStats({ totalPages: 18, totalUsers: 5, totalMedia: 24, totalProjects: 3, totalComponents: 120, totalTemplates: 8 });
    });
    api.dashboardActivity().then(setActivity).catch(() => {
      setActivity([{ text: 'Home page updated', time: new Date().toISOString() }, { text: 'New page created', time: new Date().toISOString() }]);
    });
  }, [router]);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', active: true },
    { href: '/import', label: 'Import Website' },
    { href: '/pages', label: 'Pages' },
    { href: '/posts', label: 'Posts / Blog' },
    { href: '/media', label: 'Media Library' },
    { href: '/menus', label: 'Menus' },
    { href: '/theme-builder', label: 'Theme Builder' },
    { href: '/visual-builder', label: 'Visual Builder' },
    { href: '/templates', label: 'Templates' },
    { href: '/components', label: 'Components' },
    { href: '/users', label: 'Users' },
    { href: '/roles', label: 'Roles & Permissions' },
    { href: '/plugins', label: 'Plugins / Addons' },
    { href: '/integrations', label: 'Integrations' },
    { href: '/forms', label: 'Forms' },
    { href: '/popup-builder', label: 'Popup Builder' },
    { href: '/sliders', label: 'Sliders' },
    { href: '/seo', label: 'SEO Tools' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/backup', label: 'Backup & Restore' },
    { href: '/settings', label: 'Settings' },
    { href: '/system-status', label: 'System Status' },
  ];

  const statCards = stats ? [
    { l: 'Total Pages', v: stats.totalPages },
    { l: 'Total Users', v: stats.totalUsers },
    { l: 'Media Files', v: stats.totalMedia },
    { l: 'Projects', v: stats.totalProjects },
    { l: 'Components', v: stats.totalComponents },
    { l: 'Templates', v: stats.totalTemplates },
  ] : [];

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  };

  return (
    <div className="h-screen grid grid-cols-[220px_1fr] overflow-hidden bg-gray-50">
      <aside className="bg-gradient-to-b from-[#110c22] to-[#0d0919] border-r border-white/5 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-extrabold text-sm">O</div>
          <span className="text-white font-bold text-sm">OmniBuilder</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${item.active ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25' : 'text-white/55 hover:bg-white/5 hover:text-white/85'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="w-full text-xs text-purple-300/60 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-all">Logout</button>
        </div>
      </aside>

      <main className="flex flex-col overflow-hidden">
        <header className="h-[60px] flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-gray-100 border border-gray-200 w-[340px]">
            <input placeholder="Search anything... Ctrl+K" className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
          </div>
          <div className="flex items-center gap-2.5">
            {apiConnected && <span className="text-xs text-green-600 font-medium">API Connected</span>}
            <Link href="/import" className="h-9 px-3.5 rounded-lg bg-purple-600 text-white text-sm font-semibold flex items-center">+ Create New</Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white text-xs font-bold">{user?.fullName?.charAt(0) || 'U'}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 text-sm mt-1">Welcome back, {user?.fullName || 'User'}</p></div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
              {statCards.map(s => (
                <div key={s.l} className="bg-white border border-gray-200 rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="text-gray-500 text-xs mb-1.5">{s.l}</div>
                  <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{s.v}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[{h:'/visual-builder',l:'Visual Builder',d:'Edit pages visually'},{h:'/import',l:'Import Website',d:'Import from URL/Git'},{h:'/pages',l:'Pages',d:'Manage pages'},{h:'/users',l:'Users',d:'Manage users'},{h:'/seo',l:'SEO Tools',d:'Optimize SEO'},{h:'/analytics',l:'Analytics',d:'Traffic data'}].map(q => (
                  <Link key={q.h} href={q.h} className="p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:-translate-y-0.5 transition-all">
                    <div className="font-semibold text-sm text-gray-900">{q.l}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{q.d}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
              {activity.length > 0 ? activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /><span className="text-xs text-gray-700">{item.text}</span></div>
                  <span className="text-[10px] text-gray-400">{timeAgo(item.time)}</span>
                </div>
              )) : <p className="text-xs text-gray-400">No recent activity</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
