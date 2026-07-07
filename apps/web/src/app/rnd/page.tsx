'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../components/layout-shell';

/**
 * R&D (Research & Development) Page
 * 
 * This page holds experimental features like HTML-to-Builder conversion.
 * Pages that were imported can be queued here for full builder node conversion.
 * This is the Option B (Elementor approach) workspace.
 */

interface ConversionJob {
  id: string;
  pageName: string;
  projectName: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  createdAt: string;
}

export default function RnDPage() {
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('rnd-jobs');
    if (saved) try { setJobs(JSON.parse(saved)); } catch {}
    const projs = localStorage.getItem('imported-projects');
    if (projs) try { setProjects(JSON.parse(projs)); } catch {}
  }, []);

  const queueConversion = (projectName: string, pageName: string) => {
    const job: ConversionJob = {
      id: 'job-' + Date.now(),
      pageName,
      projectName,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
    const updated = [...jobs, job];
    setJobs(updated);
    localStorage.setItem('rnd-jobs', JSON.stringify(updated));

    // Simulate processing
    setTimeout(() => {
      const u = updated.map(j => j.id === job.id ? {...j, status: 'processing' as const} : j);
      setJobs(u);
      localStorage.setItem('rnd-jobs', JSON.stringify(u));
      setTimeout(() => {
        const u2 = u.map(j => j.id === job.id ? {...j, status: 'done' as const} : j);
        setJobs(u2);
        localStorage.setItem('rnd-jobs', JSON.stringify(u2));
      }, 3000);
    }, 1000);
  };

  const clearJobs = () => {
    setJobs([]);
    localStorage.removeItem('rnd-jobs');
  };

  return (
    <LayoutShell>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">R&D Lab</h1>
            <p className="text-gray-500 text-xs">Experimental: Convert imported pages to full builder nodes (Elementor approach)</p>
          </div>
          {jobs.length > 0 && <button onClick={clearJobs} className="text-xs text-red-600 font-semibold">Clear All</button>}
        </div>

        {/* Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-purple-800 mb-1">About HTML-to-Builder Conversion</h3>
          <p className="text-xs text-purple-700 leading-relaxed">
            This feature attempts to parse imported HTML pages into OmniBuilder native nodes.
            Unlike the YellowPencil editor (which preserves the original HTML), this converts
            each element into a draggable builder block. Complex layouts may not convert perfectly.
            This is an experimental R&D feature for future development.
          </p>
        </div>

        {/* Queue jobs from imported projects */}
        {projects.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Queue Pages for Conversion</h3>
            {projects.map((proj: any) => (
              <div key={proj.id} className="mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">{proj.name}</div>
                <div className="flex flex-wrap gap-1">
                  {(proj.pages || []).map((page: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => queueConversion(proj.name, page.name)}
                      disabled={jobs.some(j => j.pageName === page.name && j.projectName === proj.name)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job list */}
        {jobs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Conversion Jobs</h3>
            </div>
            {jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium">{job.pageName}</div>
                  <div className="text-[10px] text-gray-400">{job.projectName}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  job.status === 'done' ? 'bg-green-100 text-green-700' :
                  job.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                  job.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{job.status}</span>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && jobs.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-2">No imported websites to convert.</p>
            <button onClick={() => router.push('/import')} className="text-xs text-purple-600 font-semibold">Import a website first</button>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
