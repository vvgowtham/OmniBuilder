'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (u) setUser(JSON.parse(u));
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

  return (
    <div className="h-screen grid grid-cols-[220px_1fr] overflow-hidden bg-gray-50">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="flex flex-col overflow-hidden">
        <header className="h-[60px] flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-gray-100 border border-gray-200 w-[340px]">
            <input placeholder="Search anything... Ctrl+K" className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <button className="h-9 px-3.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-all">View Site</button>
            <Link href="/import" className="h-9 px-3.5 rounded-lg bg-purple-600 text-white text-sm font-semibold flex items-center">+ Create New</Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white text-xs font-bold">{user?.fullName?.charAt(0) || 'U'}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1><p className="text-gray-500 text-sm mt-1">Your website overview and quick actions</p></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
            {[{l:'Total Pages',v:'18'},{l:'Total Posts',v:'5'},{l:'Media Files',v:'24'},{l:'Users',v:'5'},{l:'Components',v:'120+'},{l:'Templates',v:'8'}].map(s => (
              <div key={s.l} className="bg-white border border-gray-200 rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="text-gray-500 text-xs mb-1.5">{s.l}</div>
                <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{s.v}</div>
              </div>
            ))}
          </div>

          {/* Quick Access */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[{h:'/visual-builder',l:'Visual Builder',d:'Edit pages visually'},{h:'/import',l:'Import Website',d:'Import from URL/Git'},{h:'/templates',l:'Templates',d:'Manage templates'},{h:'/components',l:'Components',d:'Reusable blocks'},{h:'/seo',l:'SEO Tools',d:'Optimize SEO'},{h:'/analytics',l:'Analytics',d:'Traffic data'}].map(q => (
                <Link key={q.h} href={q.h} className="p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:-translate-y-0.5 transition-all">
                  <div className="font-semibold text-sm text-gray-900">{q.l}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{q.d}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity + Status */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
              {['Home page updated','New page Services created','Main menu edited','User Sarah added','Backup completed'].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /><span className="text-sm text-gray-700">{item}</span></div>
                  <span className="text-xs text-gray-400">{['2m','15m','1h','3h','5h'][i]} ago</span>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">System Status</h3>
              {[['Server','Nginx'],['Runtime','Node 22'],['Database','PostgreSQL'],['Storage','2.45 GB / 10 GB'],['Status','Operational']].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className={v === 'Operational' ? 'text-green-600 font-bold' : 'text-gray-900'}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
