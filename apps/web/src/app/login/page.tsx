'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@omnibuilder.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError('Invalid credentials'); setLoading(false); return; }
      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Cannot connect to API server');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#0f0a1e]">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30">O</div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">OmniBuilder</h1>
              <p className="text-sm text-purple-300/60">Universal Visual Website Builder</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight mb-1">Welcome Back!</h2>
          <p className="text-purple-300/60 mb-8">Login to your account</p>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-purple-300/70 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@omnibuilder.com" className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm text-purple-300/70 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:border-purple-500 focus:outline-none transition-all" required />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-purple-300/60 cursor-pointer">
                <input type="checkbox" className="accent-purple-600" defaultChecked /> Remember me
              </label>
              <a href="#" className="text-purple-400">Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="relative my-6 text-center text-sm text-purple-300/50">
            <span className="relative z-10 bg-[#0f0a1e] px-4">Or continue with</span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="h-11 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all">Google</button>
            <button className="h-11 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all">Microsoft</button>
          </div>

          <p className="text-center text-sm text-purple-300/50">Don&apos;t have an account? <a href="/register" className="text-purple-400 font-semibold">Sign up</a></p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center border-l border-white/5 bg-[#0d0919] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(124,58,237,0.08),transparent_60%)]" />
        <div className="relative w-[460px] h-[380px]">
          <div className="absolute w-[82%] h-[68%] top-[16%] left-[9%] z-10 rounded-2xl bg-[#221a38] border border-white/[0.08] shadow-2xl" />
          <div className="absolute w-[55%] h-[50%] bottom-0 right-0 z-20 rounded-2xl bg-[#2d2248] border border-white/[0.08] shadow-2xl" />
          <div className="absolute w-[40%] h-[38%] top-0 left-0 z-0 rounded-2xl bg-[#1a1230] border border-white/[0.08] opacity-60" />
        </div>
      </div>
    </div>
  );
}
