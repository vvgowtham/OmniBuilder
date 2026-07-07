'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportPage() {
  const [method, setMethod] = useState<string | null>(null);
  const [sourceRef, setSourceRef] = useState('');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const methods = [
    { key: 'url', icon: '🌐', label: 'Live URL', desc: 'Import from any live website' },
    { key: 'git', icon: '📂', label: 'Git Repository', desc: 'Clone from GitHub, GitLab' },
    { key: 'zip', icon: '📦', label: 'ZIP Upload', desc: 'Upload project archive' },
    { key: 'ftp', icon: '🖥️', label: 'FTP / SFTP', desc: 'Connect to server' },
    { key: 'folder', icon: '📁', label: 'Local Folder', desc: 'Select directory' },
  ];

  const startImport = () => {
    setStep(1);
    let p = 0;
    const iv = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) { clearInterval(iv); setTimeout(() => setStep(2), 500); }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6"><Link href="/dashboard" className="text-purple-600 text-sm">← Back to Dashboard</Link></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Import Website</h1>
        <p className="text-gray-500 text-sm mb-8">Import any existing website or project for visual editing</p>

        {step === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Choose Import Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {methods.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)} className={`p-4 rounded-xl border-2 text-center transition-all ${method === m.key ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="text-sm font-bold text-gray-900">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
            {method && (
              <>
                <input value={sourceRef} onChange={e => setSourceRef(e.target.value)} placeholder={method === 'url' ? 'https://example.com' : method === 'git' ? 'https://github.com/user/repo' : 'Enter path...'} className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm mb-4 focus:border-purple-500 focus:outline-none" />
                <button onClick={startImport} className="h-10 px-5 rounded-xl bg-purple-600 text-white font-semibold text-sm">Start Import & Analysis</button>
              </>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis in Progress</h3>
            <p className="text-sm text-gray-500 mb-6">Scanning project structure, detecting frameworks...</p>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-3"><div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: progress + '%' }} /></div>
            <p className="text-xs text-gray-400">{progress}%</p>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-green-600 mb-2">Analysis Complete</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
              {[['Framework','Next.js 14'],['Language','TypeScript'],['CSS','Tailwind'],['Components','47']].map(([k,v]) => (
                <div key={k} className="p-3 rounded-xl border border-gray-200"><div className="text-xs text-gray-500">{k}</div><div className="font-bold text-purple-600">{v}</div></div>
              ))}
            </div>
            <button onClick={() => router.push('/visual-builder')} className="h-10 px-5 rounded-xl bg-purple-600 text-white font-semibold text-sm">Open Visual Builder →</button>
          </div>
        )}
      </div>
    </div>
  );
}
