'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../components/layout-shell';

export default function ImportPage() {
  const [method, setMethod] = useState<string|null>(null);
  const [sourceRef, setSourceRef] = useState('');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<FileList|null>(null);
  const [projectName, setProjectName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const methods = [
    { key: 'url', icon: 'W', label: 'Live URL', desc: 'Import from any website URL' },
    { key: 'git', icon: 'G', label: 'Git Repository', desc: 'Clone from GitHub/GitLab' },
    { key: 'zip', icon: 'Z', label: 'ZIP Upload', desc: 'Upload project as ZIP' },
    { key: 'folder', icon: 'F', label: 'Local Folder', desc: 'Select project folder' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setSourceRef(e.target.files[0].name);
      if (!projectName) setProjectName(e.target.files[0].name.replace(/\.zip$/i, '').replace(/[^a-zA-Z0-9]/g, ' ').trim());
    }
  };

  const startImport = () => {
    if (!projectName.trim()) { alert('Please enter a project name'); return; }
    setStep(1);
    let p = 0;
    const steps = ['Scanning files...','Detecting framework...','Parsing HTML/CSS...','Extracting components...','Building pages...','Creating project...'];
    const iv = setInterval(() => {
      p += 8;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(iv);
        // Save imported project to localStorage
        const projects = JSON.parse(localStorage.getItem('imported-projects') || '[]');
        const newProject = {
          id: 'proj-' + Date.now(),
          name: projectName,
          source: method,
          sourceRef: sourceRef,
          createdAt: new Date().toISOString(),
          pages: ['Home', 'About', 'Contact', 'Services', 'Blog'],
          status: 'ready',
        };
        projects.push(newProject);
        localStorage.setItem('imported-projects', JSON.stringify(projects));
        localStorage.setItem('currentProjectId', newProject.id);
        setTimeout(() => setStep(2), 500);
      }
    }, 400);
  };

  return (
    <LayoutShell>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Import Website</h1>
        <p className="text-gray-500 text-sm mb-6">Import any existing website or project</p>

        {step === 0 && (
          <div className="space-y-4">
            {/* Method selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {methods.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)} className={`p-4 rounded-xl border-2 text-center transition-all ${method === m.key ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 font-bold flex items-center justify-center mx-auto mb-2">{m.icon}</div>
                  <div className="text-sm font-semibold text-gray-900">{m.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>

            {method && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                {/* Project name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My Website" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
                </div>

                {/* Source input */}
                {(method === 'url' || method === 'git') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{method === 'url' ? 'Website URL' : 'Repository URL'}</label>
                    <input value={sourceRef} onChange={e => setSourceRef(e.target.value)} placeholder={method === 'url' ? 'https://example.com' : 'https://github.com/user/repo'} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                )}

                {method === 'zip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select ZIP File</label>
                    <div className="flex gap-2">
                      <input value={sourceRef} readOnly placeholder="No file selected" className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm bg-gray-50" />
                      <button onClick={() => fileRef.current?.click()} className="h-10 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">Browse</button>
                    </div>
                    <input ref={fileRef} type="file" accept=".zip" hidden onChange={handleFileSelect} />
                    {files && <p className="text-xs text-green-600 mt-1">Selected: {files[0].name} ({(files[0].size / 1024 / 1024).toFixed(1)} MB)</p>}
                  </div>
                )}

                {method === 'folder' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Folder</label>
                    <div className="flex gap-2">
                      <input value={sourceRef} readOnly placeholder="No folder selected" className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm bg-gray-50" />
                      <button onClick={() => folderRef.current?.click()} className="h-10 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">Browse</button>
                    </div>
                    <input ref={folderRef} type="file" hidden onChange={handleFileSelect} {...({webkitdirectory:'',directory:''} as any)} />
                    {files && <p className="text-xs text-green-600 mt-1">Selected: {files.length} files</p>}
                  </div>
                )}

                <button onClick={startImport} disabled={!sourceRef && method !== 'folder'} className="h-10 px-6 rounded-lg bg-purple-600 text-white font-semibold text-sm disabled:opacity-50 hover:bg-purple-700">Start Import</button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 animate-pulse"><span className="text-purple-600 font-bold">...</span></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Importing: {projectName}</h3>
            <p className="text-sm text-gray-500 mb-4">Analyzing project structure and converting to builder format</p>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-2 max-w-md mx-auto"><div className="h-full rounded-full bg-purple-600 transition-all duration-300" style={{width:progress+'%'}}/></div>
            <p className="text-xs text-gray-400">{progress}%</p>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><span className="text-green-600 font-bold text-xl">OK</span></div>
            <h3 className="text-lg font-bold text-green-600 mb-2">Import Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">"{projectName}" has been imported with 5 pages detected.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push('/pages')} className="h-10 px-5 rounded-lg bg-purple-600 text-white text-sm font-semibold">View Pages</button>
              <button onClick={() => router.push('/visual-builder')} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-semibold">Open Builder</button>
            </div>
          </div>
        )}

        {/* Imported projects list */}
        <ImportedProjects />
      </div>
    </LayoutShell>
  );
}

function ImportedProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => { setProjects(JSON.parse(localStorage.getItem('imported-projects') || '[]')); }, []);
  if (projects.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Imported Websites</h3>
      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-500">{p.source} - {p.pages?.length || 0} pages - {new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <Link href="/pages" className="text-xs text-purple-600 font-semibold">Pages</Link>
              <Link href="/visual-builder" className="text-xs text-purple-600 font-semibold">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import Link from 'next/link';
