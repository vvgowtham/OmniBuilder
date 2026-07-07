'use client';

import { useState } from 'react';
import Link from 'next/link';

const ELEMENTS = ['Section','Container','Heading','Text','Image','Button','Video','Form','Slider','Tabs','Accordion','Counter','Testimonial','Pricing Table','Map','Code Block','Divider','Spacer','Icon','Social Icons'];

export default function VisualBuilderPage() {
  const [breakpoint, setBreakpoint] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [selectedEl, setSelectedEl] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
        <Link href="/dashboard" className="text-sm text-purple-600 font-medium">← Back</Link>
        <div className="flex items-center gap-1.5">
          {(['desktop','tablet','mobile'] as const).map(bp => (
            <button key={bp} onClick={() => setBreakpoint(bp)} className={`w-8 h-8 rounded-lg border text-xs transition-all ${breakpoint === bp ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 hover:bg-gray-100'}`}>
              {bp === 'desktop' ? '🖥' : bp === 'tablet' ? '📱' : '📲'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold">Save</button>
          <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold">Preview</button>
          <button className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">Publish</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[220px_1fr_240px] overflow-hidden">
        {/* Elements Panel */}
        <div className="bg-white border-r border-gray-200 overflow-y-auto p-3">
          <h4 className="font-bold text-sm text-gray-900 mb-3">Elements</h4>
          <div className="space-y-1.5">
            {ELEMENTS.map(el => (
              <div key={el} draggable className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-grab hover:border-purple-400 hover:bg-purple-50 transition-all text-xs font-medium text-gray-700">
                <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px]">⬡</span>
                {el}
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-gray-100 overflow-y-auto p-5 flex flex-col items-center">
          <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all ${breakpoint === 'desktop' ? 'w-full max-w-[1100px]' : breakpoint === 'tablet' ? 'w-[768px]' : 'w-[375px]'}`}>
            <section className="py-16 px-8 text-center border-2 border-dashed border-transparent hover:border-purple-400 transition-all cursor-pointer" onClick={() => setSelectedEl('hero')}>
              <h1 className="text-4xl font-bold text-gray-900 mb-3" contentEditable suppressContentEditableWarning>We Build Amazing Digital Experiences</h1>
              <p className="text-gray-500 max-w-lg mx-auto mb-6" contentEditable suppressContentEditableWarning>We help businesses grow with beautiful websites and modern design.</p>
              <button className="bg-purple-600 text-white px-7 py-3 rounded-xl font-bold text-sm">Get Services</button>
            </section>
            <section className="py-12 px-8 border-2 border-dashed border-transparent hover:border-purple-400 transition-all">
              <div className="grid grid-cols-3 gap-5">
                {['Web Design','Development','SEO'].map(s => (
                  <div key={s} className="p-6 rounded-xl border border-gray-200 text-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 mx-auto mb-3" />
                    <h3 className="font-bold text-sm mb-1" contentEditable suppressContentEditableWarning>{s}</h3>
                    <p className="text-xs text-gray-500" contentEditable suppressContentEditableWarning>Professional services</p>
                  </div>
                ))}
              </div>
            </section>
            <div className="py-8 px-8 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl m-4 min-h-[80px]">+ Drop elements here</div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="bg-white border-l border-gray-200 overflow-y-auto p-3">
          <h4 className="font-bold text-sm text-gray-900 mb-3">Properties</h4>
          {selectedEl ? (
            <div className="space-y-4">
              <div><label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Content</label><textarea className="w-full h-16 rounded-lg border border-gray-200 p-2 text-xs resize-none focus:border-purple-500 focus:outline-none" defaultValue="We Build Amazing Digital Experiences" /></div>
              <div><label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Font Size</label><input className="w-full h-8 rounded-lg border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" defaultValue="2.5rem" /></div>
              <div><label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Font Weight</label><select className="w-full h-8 rounded-lg border border-gray-200 px-2 text-xs"><option>700</option><option>600</option><option>500</option><option>400</option></select></div>
              <div><label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Color</label><div className="flex gap-1.5"><input type="color" defaultValue="#111827" className="w-8 h-8 rounded border-0 cursor-pointer" /><input className="flex-1 h-8 rounded-lg border border-gray-200 px-2 text-xs" defaultValue="#111827" /></div></div>
              <div><label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Alignment</label><div className="flex gap-1">{['L','C','R'].map((a,i) => (<button key={a} className={`w-7 h-7 rounded border text-[10px] font-bold ${i===1 ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-200'}`}>{a}</button>))}</div></div>
            </div>
          ) : <p className="text-xs text-gray-400">Click an element on the canvas to edit its properties</p>}
        </div>
      </div>
    </div>
  );
}
