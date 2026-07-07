'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.message || 'Registration failed'); setLoading(false); return; }
      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch { setError('Cannot connect to API server'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a1e] p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-xl">O</div>
          <div><h1 className="text-xl font-bold text-white">OmniBuilder</h1><p className="text-sm text-purple-300/60">Create your account</p></div>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div><label className="block text-sm text-purple-300/70 mb-1.5">Full Name</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-purple-500 focus:outline-none" required /></div>
          <div><label className="block text-sm text-purple-300/70 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-purple-500 focus:outline-none" required /></div>
          <div><label className="block text-sm text-purple-300/70 mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white focus:border-purple-500 focus:outline-none" required /></div>
          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold shadow-lg shadow-purple-600/30 disabled:opacity-60">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-purple-300/50 mt-6">Already have an account? <a href="/login" className="text-purple-400 font-semibold">Login</a></p>
      </div>
    </div>
  );
}
