'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  {href:'/dashboard',label:'Dashboard',icon:'D'},
  {href:'/websites',label:'Websites',icon:'WL'},
  {href:'/import',label:'Import',icon:'I'},
  {href:'/projects',label:'Projects',icon:'P'},
  {href:'/pages',label:'Pages',icon:'Pg'},
  {href:'/visual-builder',label:'Builder',icon:'B'},
  {href:'/website-editor',label:'YP Editor',icon:'YP'},
  {href:'/style-editor',label:'CSS Editor',icon:'CS'},
  {href:'/media',label:'Media',icon:'M'},
  {href:'/components',label:'Components',icon:'C'},
  {href:'/menus',label:'Menus',icon:'Mn'},
  {href:'/forms',label:'Forms',icon:'F'},
  {href:'/users',label:'Users',icon:'U'},
  {href:'/templates',label:'Templates',icon:'T'},
  {href:'/settings',label:'Settings',icon:'S'},
  {href:'/analytics',label:'Analytics',icon:'An'},
  {href:'/ai',label:'AI Builder',icon:'AI'},
  {href:'/rnd',label:'R&D Lab',icon:'RD'},
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <aside className={`${collapsed ? 'w-[48px]' : 'w-[170px]'} bg-gradient-to-b from-[#110c22] to-[#0d0919] border-r border-white/5 flex flex-col shrink-0 transition-all duration-200`}>
        <div className="flex items-center gap-2 px-2 py-3 border-b border-white/5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-extrabold text-[9px] shrink-0">O</div>
          {!collapsed && <span className="text-white font-bold text-[11px]">OmniBuilder</span>}
        </div>
        <nav className="flex-1 overflow-y-auto p-1 space-y-px">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${pathname === item.href ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' : 'text-white/45 hover:bg-white/5 hover:text-white/75'}`}>
              <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[7px] font-bold shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-1 border-t border-white/5">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full text-[8px] text-purple-300/40 hover:text-white py-1 rounded hover:bg-white/5">{collapsed ? '>' : 'Collapse'}</button>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="w-full text-[8px] text-purple-300/40 hover:text-white py-1 rounded hover:bg-white/5">{collapsed ? '' : 'Logout'}</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
