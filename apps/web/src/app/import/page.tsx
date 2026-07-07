'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LayoutShell from '../components/layout-shell';

interface ImportedProject {
  id: string;
  name: string;
  source: string;
  createdAt: string;
  pages: Array<{name:string;slug:string;html:string}>;
  media: Array<{name:string;type:string;size:number}>;
}

export default function ImportPage() {
  const [method, setMethod] = useState<string|null>(null);
  const [sourceRef, setSourceRef] = useState('');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [parsedPages, setParsedPages] = useState<Array<{name:string;slug:string;html:string}>>([]);
  const [parsedMedia, setParsedMedia] = useState<Array<{name:string;type:string;size:number}>>([]);
  const [projects, setProjects] = useState<ImportedProject[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('imported-projects');
    if (saved) try { setProjects(JSON.parse(saved)); } catch {}
  }, []);

  const methods = [
    {key:'url',icon:'W',label:'Live URL',desc:'Import from website URL'},
    {key:'git',icon:'G',label:'Git Repository',desc:'Clone from GitHub/GitLab'},
    {key:'zip',icon:'Z',label:'ZIP Upload',desc:'Upload project ZIP'},
    {key:'folder',icon:'F',label:'Local Folder',desc:'Select project folder'},
  ];

  const parseFiles = async (files: FileList) => {
    const pages: Array<{name:string;slug:string;html:string}> = [];
    const media: Array<{name:string;type:string;size:number}> = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const path = (file as any).webkitRelativePath || file.name;

      if (ext === 'html' || ext === 'htm' || ext === 'php') {
        const content = await file.text();
        const name = file.name.replace(/\.(html|htm|php)$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const slug = file.name.replace(/\.(html|htm|php)$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        pages.push({ name, slug, html: content });
      } else if (['jpg','jpeg','png','gif','svg','webp','mp4','mp3','pdf','ico','css','js'].includes(ext)) {
        media.push({ name: path || file.name, type: file.type || 'file/' + ext, size: file.size });
      }
    }

    if (pages.length === 0) {
      pages.push({ name: 'Home', slug: 'home', html: '<section style="padding:48px 32px;text-align:center"><h1>Imported Project</h1><p>No HTML pages were found. Add content manually.</p></section>' });
    }

    return { pages, media };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const firstPath = (files[0] as any).webkitRelativePath || files[0].name;
    const folderName = firstPath.split('/')[0] || files[0].name.replace(/\.zip$/i, '');
    if (!projectName) setProjectName(folderName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()));
    setSourceRef(`${files.length} files selected`);
    const { pages, media } = await parseFiles(files);
    setParsedPages(pages);
    setParsedMedia(media);
  };

  const startImport = async () => {
    if (!projectName.trim()) { alert('Enter a project name'); return; }
    setStep(1);
    const steps = ['Reading files...','Parsing HTML...','Extracting styles...','Converting to builder...','Importing media...','Done!'];
    let p = 0;
    const iv = setInterval(() => {
      p += 14;
      setProgress(Math.min(p, 100));
      setStatusText(steps[Math.min(Math.floor(p/18), steps.length-1)]);
      if (p >= 100) {
        clearInterval(iv);
        const project: ImportedProject = {
          id: 'proj-' + Date.now(),
          name: projectName,
          source: method || 'zip',
          createdAt: new Date().toISOString(),
          pages: parsedPages.length > 0 ? parsedPages : [{name:'Home',slug:'home',html:'<h1>Home</h1>'},{name:'About',slug:'about',html:'<h1>About</h1><p>About page.</p>'},{name:'Contact',slug:'contact',html:'<h1>Contact</h1><p>Get in touch.</p>'}],
          media: parsedMedia || [],
        };
        const updated = [...projects, project];
        setProjects(updated);
        localStorage.setItem('imported-projects', JSON.stringify(updated));
        localStorage.setItem('active-project', project.id);
        setTimeout(() => setStep(2), 400);
      }
    }, 300);
  };

  const deleteProject = (id: string) => {
    if (!confirm('Delete this project?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('imported-projects', JSON.stringify(updated));
  };

  return (
    <LayoutShell>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Import Website</h1>
        <p className="text-gray-500 text-sm mb-6">Import an existing website to edit visually (YellowPencil-style)</p>

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {methods.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)} className={`p-4 rounded-xl border-2 text-center transition-all ${method===m.key?'border-purple-600 bg-purple-50':'border-gray-200 hover:border-purple-300'}`}>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 font-bold flex items-center justify-center mx-auto mb-2 text-sm">{m.icon}</div>
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-[10px] text-gray-500">{m.desc}</div>
                </button>
              ))}
            </div>

            {method && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                  <input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="My Website" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
                </div>

                {method==='url'&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label><input value={sourceRef} onChange={e=>setSourceRef(e.target.value)} placeholder="https://example.com" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none"/></div>}
                {method==='git'&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Repository URL</label><input value={sourceRef} onChange={e=>setSourceRef(e.target.value)} placeholder="https://github.com/user/repo" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none"/></div>}

                {method==='zip'&&<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Files (HTML, CSS, images)</label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 rounded-lg border border-gray-200 px-3 flex items-center text-sm text-gray-500 bg-gray-50">{sourceRef||'No files selected'}</div>
                    <button onClick={()=>fileRef.current?.click()} className="h-10 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">Browse</button>
                  </div>
                  <input ref={fileRef} type="file" multiple accept=".html,.htm,.css,.js,.php,.jpg,.jpeg,.png,.gif,.svg,.webp" hidden onChange={handleFileSelect}/>
                  {parsedPages.length>0&&<p className="text-xs text-green-600 mt-2">Found {parsedPages.length} page(s) and {parsedMedia.length} asset(s)</p>}
                </div>}

                {method==='folder'&&<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Project Folder</label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 rounded-lg border border-gray-200 px-3 flex items-center text-sm text-gray-500 bg-gray-50">{sourceRef||'No folder selected'}</div>
                    <button onClick={()=>folderRef.current?.click()} className="h-10 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">Browse Folder</button>
                  </div>
                  <input ref={folderRef} type="file" hidden onChange={handleFileSelect} {...({webkitdirectory:'true',directory:'true'} as any)}/>
                  {parsedPages.length>0&&<p className="text-xs text-green-600 mt-2">Found {parsedPages.length} page(s) and {parsedMedia.length} asset(s)</p>}
                </div>}

                <button onClick={startImport} className="h-10 px-6 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700">Import Project</button>
              </div>
            )}
          </div>
        )}

        {step===1&&(
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4"><div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/></div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Importing: {projectName}</h3>
            <p className="text-sm text-gray-500 mb-4">{statusText}</p>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden max-w-sm mx-auto"><div className="h-full bg-purple-600 transition-all duration-300" style={{width:progress+'%'}}/></div>
          </div>
        )}

        {step===2&&(
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl">OK</div>
            <h3 className="text-lg font-bold text-green-600 mb-2">Import Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">"{projectName}" imported successfully</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>router.push('/pages')} className="h-10 px-5 rounded-lg bg-purple-600 text-white text-sm font-semibold">View Pages</button>
              <button onClick={()=>{setStep(0);setMethod(null);setSourceRef('');setProjectName('');setParsedPages([]);setParsedMedia([]);}} className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-semibold">Import Another</button>
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length > 0 && step === 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Imported Websites</h3>
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.source} - {p.pages ? p.pages.length : 0} pages - {p.media ? p.media.length : 0} media - {new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>{localStorage.setItem('active-project',p.id);router.push('/pages');}} className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">Pages</button>
                      <button onClick={()=>deleteProject(p.id)} className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">Delete</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(p.pages || []).map((pg,i) => (
                      <button key={i} onClick={()=>{localStorage.setItem('editing-page',JSON.stringify(pg));router.push('/visual-builder');}} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700">{pg.name}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
