'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV = [
  {href:'/dashboard',label:'Dashboard',icon:'D'},
  {href:'/import',label:'Import',icon:'I'},
  {href:'/projects',label:'Projects',icon:'P'},
  {href:'/pages',label:'Pages',icon:'Pg'},
  {href:'/visual-builder',label:'Builder',icon:'B'},
  {href:'/media',label:'Media',icon:'M'},
  {href:'/components',label:'Components',icon:'C'},
  {href:'/menus',label:'Menus',icon:'Mn'},
  {href:'/forms',label:'Forms',icon:'F'},
  {href:'/users',label:'Users',icon:'U'},
  {href:'/templates',label:'Templates',icon:'T'},
  {href:'/settings',label:'Settings',icon:'S'},
  {href:'/analytics',label:'Analytics',icon:'A'},
  {href:'/ai',label:'AI Builder',icon:'AI'},
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[52px]' : 'w-[200px]'} bg-gradient-to-b from-[#110c22] to-[#0d0919] border-r border-white/5 flex flex-col shrink-0 transition-all duration-200`}>
        <div className="flex items-center gap-2 px-3 py-4 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-extrabold text-[10px] shrink-0">O</div>
          {!collapsed && <span className="text-white font-bold text-xs">OmniBuilder</span>}
        </div>
        <nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${pathname === item.href ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
              <span className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5'} rounded bg-white/10 flex items-center justify-center text-[8px] font-bold shrink-0`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5 space-y-1">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full text-[9px] text-purple-300/50 hover:text-white py-1 rounded hover:bg-white/5">{collapsed ? '>' : 'Collapse'}</button>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="w-full text-[9px] text-purple-300/50 hover:text-white py-1 rounded hover:bg-white/5">{collapsed ? 'X' : 'Logout'}</button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
