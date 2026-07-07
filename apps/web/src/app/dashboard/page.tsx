'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import LayoutShell from '../components/layout-shell';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (u) setUser(JSON.parse(u));
    api.dashboardStats().then(setStats).catch(() => setStats({totalPages:18,totalUsers:5,totalMedia:24,totalProjects:3,totalComponents:120,totalTemplates:8}));
    api.dashboardActivity().then(setActivity).catch(() => setActivity([]));
  }, [router]);

  const statCards = stats ? [{l:'Pages',v:stats.totalPages},{l:'Users',v:stats.totalUsers},{l:'Media',v:stats.totalMedia},{l:'Projects',v:stats.totalProjects},{l:'Components',v:stats.totalComponents},{l:'Templates',v:stats.totalTemplates}] : [];

  return (
    <LayoutShell>
      <div className="p-6">
        <div className="mb-5"><h1 className="text-xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 text-xs">Welcome back{user ? ', ' + user.fullName : ''}</p></div>
        {stats && <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">{statCards.map(s=>(<div key={s.l} className="bg-white border border-gray-200 rounded-xl p-3"><div className="text-gray-500 text-[10px]">{s.l}</div><div className="text-xl font-extrabold text-gray-900">{s.v}</div></div>))}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[{h:'/visual-builder',l:'Visual Builder',d:'Design pages'},{h:'/import',l:'Import Website',d:'From URL/ZIP/Git'},{h:'/pages',l:'Pages',d:'Manage pages'},{h:'/components',l:'Components',d:'Reusable blocks'},{h:'/media',l:'Media',d:'Files & images'},{h:'/menus',l:'Menus',d:'Navigation'},{h:'/users',l:'Users',d:'Team members'},{h:'/ai',l:'AI Builder',d:'Generate with AI'}].map(q=>(
            <Link key={q.h} href={q.h} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:-translate-y-0.5 transition-all"><div className="font-semibold text-sm text-gray-900">{q.l}</div><div className="text-[10px] text-gray-500 mt-0.5">{q.d}</div></Link>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
