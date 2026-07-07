'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../components/layout-shell';

/**
 * YellowPencil-style editor for imported websites.
 * Renders the full original HTML in an iframe preserving all CSS/layout,
 * then allows clicking elements to edit text and styles.
 */
export default function WebsiteEditorPage() {
  const [pageHtml, setPageHtml] = useState('');
  const [pageTitle, setPageTitle] = useState('Untitled');
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [changes, setChanges] = useState<Array<{selector:string;prop:string;value:string}>>([]);
  const [saved, setSaved] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  useEffect(() => {
    const editing = localStorage.getItem('editing-page');
    if (editing) {
      try {
        const page = JSON.parse(editing);
        setPageTitle(page.name || 'Untitled');
        setPageHtml(page.html || '');
      } catch {}
    }
  }, []);

  // Inject click handler into iframe after load
  const onIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Add selection styles
    const style = doc.createElement('style');
    style.textContent = `
      .omni-selected { outline: 2px solid #7c3aed !important; outline-offset: 2px; cursor: pointer; }
      .omni-hover { outline: 1px dashed #a78bfa !important; outline-offset: 1px; }
      * { cursor: pointer !important; }
    `;
    doc.head.appendChild(style);

    // Click handler
    doc.body.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (!target) return;

      // Remove previous selection
      doc.querySelectorAll('.omni-selected').forEach(el => el.classList.remove('omni-selected'));
      target.classList.add('omni-selected');

      // Get element info
      setSelectedEl(target.tagName.toLowerCase() + (target.className ? '.' + target.className.split(' ').filter(c => c !== 'omni-selected' && c !== 'omni-hover').join('.') : ''));
      setSelectedText(target.textContent?.slice(0, 100) || '');
      setSelectedTag(target.tagName.toLowerCase());

      // Get computed styles
      const computed = iframe.contentWindow!.getComputedStyle(target);
      setStyles({
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        padding: computed.padding,
        margin: computed.margin,
        borderRadius: computed.borderRadius,
        textAlign: computed.textAlign,
        display: computed.display,
        width: computed.width,
        height: computed.height,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        border: computed.border,
        boxShadow: computed.boxShadow,
        opacity: computed.opacity,
      });
    });

    // Hover handler
    doc.body.addEventListener('mouseover', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.classList.contains('omni-selected')) {
        target.classList.add('omni-hover');
      }
    });
    doc.body.addEventListener('mouseout', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) target.classList.remove('omni-hover');
    });
  };

  const applyStyle = (prop: string, value: string) => {
    setStyles(prev => ({...prev, [prop]: value}));
    setSaved(false);

    // Apply to iframe element
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const selected = iframe.contentDocument.querySelector('.omni-selected') as HTMLElement;
    if (selected) {
      (selected.style as any)[prop] = value;
      setChanges(prev => [...prev, {selector: selectedEl || '', prop, value}]);
    }
  };

  const editText = (newText: string) => {
    setSelectedText(newText);
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const selected = iframe.contentDocument.querySelector('.omni-selected') as HTMLElement;
    if (selected) {
      selected.textContent = newText;
      setSaved(false);
    }
  };

  const saveChanges = () => {
    // Get modified HTML from iframe
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    // Remove our helper classes
    iframe.contentDocument.querySelectorAll('.omni-selected,.omni-hover').forEach(el => {
      el.classList.remove('omni-selected', 'omni-hover');
    });
    const html = iframe.contentDocument.documentElement.outerHTML;
    // Save back
    const editing = localStorage.getItem('editing-page');
    if (editing) {
      const page = JSON.parse(editing);
      page.html = html;
      localStorage.setItem('editing-page', JSON.stringify(page));
      // Also update in imported-projects
      const projects = JSON.parse(localStorage.getItem('imported-projects') || '[]');
      for (const proj of projects) {
        const pageIdx = (proj.pages || []).findIndex((p: any) => p.slug === page.slug);
        if (pageIdx >= 0) { proj.pages[pageIdx].html = html; break; }
      }
      localStorage.setItem('imported-projects', JSON.stringify(projects));
    }
    setSaved(true);
  };

  const PROP_FIELDS: [string, string][] = [
    ['fontSize','Font Size'],['fontWeight','Weight'],['color','Color'],
    ['backgroundColor','Background'],['padding','Padding'],['margin','Margin'],
    ['borderRadius','Radius'],['textAlign','Align'],['display','Display'],
    ['width','Width'],['height','Height'],['lineHeight','Line H'],
    ['letterSpacing','Letter Sp'],['border','Border'],['boxShadow','Shadow'],['opacity','Opacity'],
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/pages')} className="text-purple-600 text-xs font-medium">Back</button>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-semibold text-gray-700">{pageTitle}</span>
          <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">YellowPencil Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${saved ? 'text-green-600' : 'text-orange-500'}`}>{saved ? 'Saved' : changes.length + ' changes'}</span>
          <button onClick={saveChanges} className="h-7 px-3 rounded bg-green-600 text-white text-[10px] font-semibold">Save</button>
          <button onClick={() => router.push('/pages')} className="h-7 px-3 rounded bg-gray-100 text-[10px] font-semibold">Close</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Iframe - Full website render */}
        <div className="flex-1 overflow-hidden bg-white">
          {pageHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={pageHtml}
              className="w-full h-full border-0"
              onLoad={onIframeLoad}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No page loaded. Go to Pages and click "Edit in Builder".</p>
            </div>
          )}
        </div>

        {/* Right panel - Properties */}
        <div className="w-[240px] bg-white border-l border-gray-200 overflow-y-auto p-3">
          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Element Inspector</h4>
          {selectedEl ? (
            <div className="space-y-2">
              <div className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-1 rounded break-all">{selectedEl}</div>
              <div className="text-[9px] text-gray-400">Tag: {selectedTag}</div>

              {/* Text editing */}
              <div>
                <label className="block text-[8px] font-semibold text-gray-500 uppercase mb-0.5">Text Content</label>
                <textarea value={selectedText} onChange={e => editText(e.target.value)} className="w-full h-16 rounded border border-gray-200 p-1.5 text-[10px] resize-none focus:border-purple-500 focus:outline-none" />
              </div>

              {/* Style properties */}
              <div className="border-t border-gray-100 pt-2">
                <h5 className="text-[8px] font-bold text-gray-500 uppercase mb-1">Styles</h5>
                {PROP_FIELDS.map(([prop, label]) => (
                  <div key={prop} className="mb-1">
                    <label className="block text-[8px] text-gray-500">{label}</label>
                    <input
                      value={styles[prop] || ''}
                      onChange={e => applyStyle(prop, e.target.value)}
                      className="w-full h-[20px] rounded border border-gray-200 px-1 text-[10px] focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 mt-4">
              <p className="mb-2">Click any element on the page to select it.</p>
              <p>You can then edit its text and CSS properties here.</p>
              <p className="mt-4 text-[9px] text-purple-500 font-semibold">The full website layout and styles are preserved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
