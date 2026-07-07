'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Version history entry
interface Version { id: string; label: string; html: string; timestamp: string; }

export default function WebsiteEditorPage() {
  const [pageHtml, setPageHtml] = useState('');
  const [pageTitle, setPageTitle] = useState('Untitled');
  const [selInfo, setSelInfo] = useState<{selector:string;tag:string;classes:string;id:string}|null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{tag:string;cls:string}>>([]);
  const [styles, setStyles] = useState<Record<string,string>>({});
  const [changeCount, setChangeCount] = useState(0);
  const [saved, setSaved] = useState(true);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['text']));
  const [showNav, setShowNav] = useState(false);
  const [navTree, setNavTree] = useState<any[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const selectedElRef = useRef<HTMLElement|null>(null);

  useEffect(() => {
    const editing = localStorage.getItem('editing-page');
    if (editing) {
      try {
        const p = JSON.parse(editing);
        setPageTitle(p.name || 'Untitled');
        setPageHtml(p.html || '');
        // Load versions
        const v = localStorage.getItem('yp-versions-' + p.slug);
        if (v) try { setVersions(JSON.parse(v)); } catch {}
      } catch {}
    }
  }, []);

  const toggle = (s: string) => { const n = new Set(openSections); n.has(s)?n.delete(s):n.add(s); setOpenSections(n); };

  // Apply style to selected element in iframe
  const apply = useCallback((prop: string, value: string) => {
    const el = selectedElRef.current;
    if (!el) return;
    try {
      (el.style as any)[prop] = value;
      setStyles(prev => ({...prev, [prop]: value}));
      setChangeCount(c => c + 1);
      setSaved(false);
    } catch {}
  }, []);

  // Read computed style from selected element
  const readStyles = useCallback((el: HTMLElement) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    const cs = iframe.contentWindow.getComputedStyle(el);
    setStyles({
      fontFamily: cs.fontFamily || '',
      fontSize: cs.fontSize || '',
      fontWeight: cs.fontWeight || '',
      fontStyle: cs.fontStyle || '',
      color: cs.color || '',
      textAlign: cs.textAlign || '',
      lineHeight: cs.lineHeight || '',
      letterSpacing: cs.letterSpacing || '',
      textDecoration: cs.textDecorationLine || cs.textDecoration || '',
      textTransform: cs.textTransform || '',
      backgroundColor: cs.backgroundColor || '',
      backgroundImage: cs.backgroundImage || '',
      backgroundSize: cs.backgroundSize || '',
      backgroundPosition: cs.backgroundPosition || '',
      backgroundRepeat: cs.backgroundRepeat || '',
      paddingTop: cs.paddingTop || '', paddingRight: cs.paddingRight || '', paddingBottom: cs.paddingBottom || '', paddingLeft: cs.paddingLeft || '',
      marginTop: cs.marginTop || '', marginRight: cs.marginRight || '', marginBottom: cs.marginBottom || '', marginLeft: cs.marginLeft || '',
      borderTopWidth: cs.borderTopWidth || '', borderRightWidth: cs.borderRightWidth || '', borderBottomWidth: cs.borderBottomWidth || '', borderLeftWidth: cs.borderLeftWidth || '',
      borderStyle: cs.borderTopStyle || '', borderColor: cs.borderTopColor || '',
      borderTopLeftRadius: cs.borderTopLeftRadius || '', borderTopRightRadius: cs.borderTopRightRadius || '', borderBottomRightRadius: cs.borderBottomRightRadius || '', borderBottomLeftRadius: cs.borderBottomLeftRadius || '',
      position: cs.position || '', top: cs.top || '', right: cs.right || '', bottom: cs.bottom || '', left: cs.left || '', zIndex: cs.zIndex || '',
      width: cs.width || '', height: cs.height || '', minWidth: cs.minWidth || '', maxWidth: cs.maxWidth || '', minHeight: cs.minHeight || '', maxHeight: cs.maxHeight || '',
      display: cs.display || '', overflow: cs.overflow || '', visibility: cs.visibility || '', opacity: cs.opacity || '',
      transform: cs.transform || '', boxShadow: cs.boxShadow || '', filter: cs.filter || '',
      transitionProperty: cs.transitionProperty || '', transitionDuration: cs.transitionDuration || '',
      flexDirection: cs.flexDirection || '', alignItems: cs.alignItems || '', justifyContent: cs.justifyContent || '', gap: cs.gap || '',
    });
  }, []);

  const selectElement = useCallback((el: HTMLElement) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;

    // Remove previous
    doc.querySelectorAll('[data-omni-sel]').forEach(x => { (x as HTMLElement).style.outline = ''; x.removeAttribute('data-omni-sel'); });

    // Select
    el.setAttribute('data-omni-sel', 'true');
    el.style.outline = '2px solid #f59e0b';
    selectedElRef.current = el;

    // Info
    const tag = el.tagName.toLowerCase();
    const cls = Array.from(el.classList).filter(c => !c.startsWith('omni-')).join(' ');
    const id = el.id || '';
    setSelInfo({ selector: tag + (id ? '#' + id : '') + (cls ? '.' + cls.split(' ').slice(0,2).join('.') : ''), tag, classes: cls, id });

    // Breadcrumb
    const crumbs: Array<{tag:string;cls:string}> = [];
    let cur: HTMLElement|null = el;
    while (cur && cur !== doc.body) {
      crumbs.unshift({ tag: cur.tagName.toLowerCase(), cls: Array.from(cur.classList).filter(c=>!c.startsWith('omni-')).slice(0,1).join('') });
      cur = cur.parentElement;
    }
    crumbs.unshift({ tag: 'body', cls: '' });
    setBreadcrumb(crumbs);

    // Read styles
    readStyles(el);
  }, [readStyles]);

  const onIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;

    // Click to select (use capture to get before any site JS)
    doc.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const el = e.target as HTMLElement;
      if (el && el !== doc.body && el !== doc.documentElement) {
        selectElement(el);
      }
    }, true);

    // Hover outline
    doc.addEventListener('mouseover', (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el && !el.hasAttribute('data-omni-sel') && el !== doc.body) {
        el.style.outline = '1px dashed #fbbf24';
      }
    }, true);
    doc.addEventListener('mouseout', (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el && !el.hasAttribute('data-omni-sel')) {
        el.style.outline = '';
      }
    }, true);

    // Build nav tree
    buildNavTree(doc.body);
  };

  const buildNavTree = (root: HTMLElement) => {
    const build = (el: HTMLElement, depth: number): any => {
      if (depth > 6) return null;
      const tag = el.tagName.toLowerCase();
      const cls = Array.from(el.classList).slice(0,1).join('');
      const children = Array.from(el.children).map(c => build(c as HTMLElement, depth+1)).filter(Boolean).slice(0, 20);
      return { tag, cls, el, children };
    };
    const tree = Array.from(root.children).map(c => build(c as HTMLElement, 0)).filter(Boolean);
    setNavTree(tree);
  };

  // Save
  const saveAll = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    // Clean selection outlines
    iframe.contentDocument.querySelectorAll('[data-omni-sel]').forEach(x => { (x as HTMLElement).style.outline = ''; x.removeAttribute('data-omni-sel'); });
    const html = '<!DOCTYPE html>' + iframe.contentDocument.documentElement.outerHTML;
    // Save version
    const slug = JSON.parse(localStorage.getItem('editing-page') || '{}').slug || 'page';
    const ver: Version = { id: 'v' + Date.now(), label: 'Save ' + (versions.length + 1), html, timestamp: new Date().toISOString() };
    const newVersions = [...versions, ver];
    setVersions(newVersions);
    localStorage.setItem('yp-versions-' + slug, JSON.stringify(newVersions));
    // Save page
    const editing = JSON.parse(localStorage.getItem('editing-page') || '{}');
    editing.html = html;
    localStorage.setItem('editing-page', JSON.stringify(editing));
    // Update in projects
    const projects = JSON.parse(localStorage.getItem('imported-projects') || '[]');
    for (const proj of projects) { const idx = (proj.pages||[]).findIndex((p:any)=>p.slug===editing.slug); if(idx>=0){proj.pages[idx].html=html;break;} }
    localStorage.setItem('imported-projects', JSON.stringify(projects));
    setSaved(true);
    setChangeCount(0);
    // Re-apply selection
    setTimeout(() => { if (selectedElRef.current) selectElement(selectedElRef.current); }, 100);
  };

  // Revert to version
  const revertTo = (ver: Version) => {
    setPageHtml(ver.html);
    setShowVersions(false);
    setSaved(false);
    setChangeCount(0);
  };

  // Reset to original
  const resetToOriginal = () => {
    if (!confirm('Reset all changes to original?')) return;
    if (versions.length > 0) {
      setPageHtml(versions[0].html);
    }
    setChangeCount(0);
    setSaved(false);
  };

  // Helper: rgb to hex
  const toHex = (c: string): string => {
    if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return '#000000';
    if (c.startsWith('#')) return c;
    const m = c.match(/\d+/g);
    if (!m || m.length < 3) return '#000000';
    return '#' + m.slice(0,3).map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
  };

  // Parse numeric value
  const numVal = (v: string): string => parseFloat(v) ? parseFloat(v).toString() : '0';

  // Section component
  const Sec = ({id, title, children}: {id:string;title:string;children:React.ReactNode}) => (
    <div className="border-b border-gray-200">
      <button onClick={()=>toggle(id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
        <span className="text-[13px] font-semibold text-gray-800">{title}</span>
        <span className="text-gray-400 text-xs">{openSections.has(id)?'^':'v'}</span>
      </button>
      {openSections.has(id) && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );

  // Input with label
  const Inp = ({label, prop, unit}: {label:string;prop:string;unit?:string}) => (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input value={styles[prop]||''} onChange={e=>{apply(prop,e.target.value)}} className="flex-1 h-8 rounded-md border border-gray-300 px-2 text-[12px] text-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-200 focus:outline-none" />
        {unit && <span className="text-[10px] text-gray-400 w-5">{unit}</span>}
      </div>
    </div>
  );

  // Color input
  const ColorInp = ({label, prop}: {label:string;prop:string}) => (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={toHex(styles[prop]||'')} onChange={e=>{e.stopPropagation();apply(prop,e.target.value);}} onClick={e=>e.stopPropagation()} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0" />
        <input value={styles[prop]||''} onChange={e=>apply(prop,e.target.value)} className="flex-1 h-8 rounded-md border border-gray-300 px-2 text-[11px] text-gray-700 focus:border-amber-500 focus:outline-none" />
      </div>
    </div>
  );

  // Select input
  const Sel = ({label, prop, options}: {label:string;prop:string;options:string[]}) => (
    <div>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <select value={styles[prop]||''} onChange={e=>apply(prop,e.target.value)} className="w-full h-8 rounded-md border border-gray-300 px-2 text-[12px] text-gray-800 focus:border-amber-500 focus:outline-none">
        {options.map(o => <option key={o} value={o}>{o || '(inherit)'}</option>)}
      </select>
    </div>
  );

  // Navigator tree item
  const NavItem = ({node, depth}: {node:any;depth:number}) => (
    <div>
      <div onClick={()=>{if(node.el)selectElement(node.el);setShowNav(false);}} style={{paddingLeft:(depth*12+8)+'px'}} className="py-1 px-2 text-[11px] text-gray-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer rounded flex items-center gap-1">
        <span className="text-gray-400">{node.children?.length>0?'v':'.'}</span>
        <span className="font-medium">{node.tag}</span>
        {node.cls && <span className="text-gray-400">.{node.cls}</span>}
      </div>
      {node.children?.slice(0,15).map((c:any,i:number) => <NavItem key={i} node={c} depth={depth+1}/>)}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={()=>router.push('/pages')} className="text-amber-600 text-[12px] font-semibold">Back</button>
          <span className="text-[12px] font-semibold text-gray-800">{pageTitle}</span>
          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Visual CSS Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500">{changeCount} changes</span>
          <button onClick={()=>setShowVersions(!showVersions)} className="text-[11px] text-gray-600 hover:text-amber-600">Versions ({versions.length})</button>
          <button onClick={resetToOriginal} className="text-[11px] text-gray-600 hover:text-red-600">Reset</button>
          <span className={`text-[11px] font-medium ${saved?'text-green-600':'text-amber-600'}`}>{saved?'Saved':'Unsaved'}</span>
          <button onClick={saveAll} className="h-7 px-4 rounded-md bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600">Save</button>
        </div>
      </div>

      {/* Version panel */}
      {showVersions && (
        <div className="absolute top-10 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
          <h4 className="text-[11px] font-bold text-gray-700 mb-2">Version History</h4>
          {versions.length === 0 ? <p className="text-[10px] text-gray-400">No saves yet</p> : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {versions.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div><div className="text-[11px] font-medium">{v.label}</div><div className="text-[9px] text-gray-400">{new Date(v.timestamp).toLocaleString()}</div></div>
                  <button onClick={()=>revertTo(v)} className="text-[9px] text-amber-600 font-semibold">Revert</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        <div className="w-10 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-3 gap-2 shrink-0">
          <button onClick={()=>setShowNav(!showNav)} className={`w-7 h-7 rounded-md text-[8px] font-bold flex items-center justify-center ${showNav?'bg-amber-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'}`} title="Navigator">Nav</button>
          <button className="w-7 h-7 rounded-md bg-white border border-gray-200 text-gray-600 text-[8px] font-bold flex items-center justify-center hover:border-amber-400" title="Layers">Ly</button>
          <button className="w-7 h-7 rounded-md bg-white border border-gray-200 text-gray-600 text-[8px] font-bold flex items-center justify-center hover:border-amber-400" title="Responsive">Rsp</button>
          <button className="w-7 h-7 rounded-md bg-white border border-gray-200 text-gray-600 text-[8px] font-bold flex items-center justify-center hover:border-amber-400" title="Code">CSS</button>
        </div>

        {/* Navigator panel */}
        {showNav && (
          <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto p-2">
            <h4 className="text-[11px] font-bold text-gray-700 px-2 mb-2">Navigator</h4>
            {navTree.map((node, i) => <NavItem key={i} node={node} depth={0}/>)}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          {pageHtml ? (
            <iframe ref={iframeRef} srcDoc={pageHtml} className="w-full h-full border-0" onLoad={onIframeLoad}/>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400"><p>No page loaded</p></div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Element info */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            {selInfo ? (
              <div>
                <div className="text-[11px] font-mono text-amber-600 font-semibold truncate">{selInfo.selector}</div>
                <div className="text-[10px] text-gray-400">Tag: {selInfo.tag} {selInfo.id && '| ID: '+selInfo.id}</div>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400">Click any element on the page to select it</div>
            )}
          </div>

          {/* Scrollable property sections */}
          <div className="flex-1 overflow-y-auto">
            {/* Text */}
            <Sec id="text" title="Text">
              <Inp label="Font Family" prop="fontFamily" />
              <ColorInp label="Color" prop="color" />
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Font Size" prop="fontSize" unit="px" />
                <Sel label="Weight" prop="fontWeight" options={['','100','200','300','400','500','600','700','800','900']} />
              </div>
              <Inp label="Line Height" prop="lineHeight" />
              <div className="grid grid-cols-2 gap-2">
                <Sel label="Style" prop="fontStyle" options={['','normal','italic']} />
                <Sel label="Transform" prop="textTransform" options={['','none','uppercase','lowercase','capitalize']} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Sel label="Decoration" prop="textDecoration" options={['','none','underline','line-through','overline']} />
                <Sel label="Align" prop="textAlign" options={['','left','center','right','justify']} />
              </div>
              <Inp label="Letter Spacing" prop="letterSpacing" />
            </Sec>

            {/* Background */}
            <Sec id="background" title="Background">
              <ColorInp label="Background Color" prop="backgroundColor" />
              <Inp label="Image" prop="backgroundImage" />
              <div className="grid grid-cols-2 gap-2">
                <Sel label="Size" prop="backgroundSize" options={['','auto','cover','contain']} />
                <Sel label="Repeat" prop="backgroundRepeat" options={['','repeat','no-repeat','repeat-x','repeat-y']} />
              </div>
              <Inp label="Position" prop="backgroundPosition" />
            </Sec>

            {/* Spacings */}
            <Sec id="spacings" title="Spacings">
              <p className="text-[10px] text-gray-500 font-semibold">Padding</p>
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Top" prop="paddingTop" unit="px" />
                <Inp label="Right" prop="paddingRight" unit="px" />
                <Inp label="Bottom" prop="paddingBottom" unit="px" />
                <Inp label="Left" prop="paddingLeft" unit="px" />
              </div>
              <p className="text-[10px] text-gray-500 font-semibold mt-2">Margin</p>
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Top" prop="marginTop" unit="px" />
                <Inp label="Right" prop="marginRight" unit="px" />
                <Inp label="Bottom" prop="marginBottom" unit="px" />
                <Inp label="Left" prop="marginLeft" unit="px" />
              </div>
            </Sec>

            {/* Borders */}
            <Sec id="borders" title="Borders">
              <ColorInp label="Border Color" prop="borderColor" />
              <Sel label="Style" prop="borderStyle" options={['','none','solid','dashed','dotted','double']} />
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Top" prop="borderTopWidth" unit="px" />
                <Inp label="Right" prop="borderRightWidth" unit="px" />
                <Inp label="Bottom" prop="borderBottomWidth" unit="px" />
                <Inp label="Left" prop="borderLeftWidth" unit="px" />
              </div>
            </Sec>

            {/* Border Radius */}
            <Sec id="radius" title="Border Radius">
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Top Left" prop="borderTopLeftRadius" unit="px" />
                <Inp label="Top Right" prop="borderTopRightRadius" unit="px" />
                <Inp label="Bottom Left" prop="borderBottomLeftRadius" unit="px" />
                <Inp label="Bottom Right" prop="borderBottomRightRadius" unit="px" />
              </div>
            </Sec>

            {/* Positioning */}
            <Sec id="positioning" title="Positioning">
              <Sel label="Position" prop="position" options={['','static','relative','absolute','fixed','sticky']} />
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Top" prop="top" unit="px" />
                <Inp label="Right" prop="right" unit="px" />
                <Inp label="Bottom" prop="bottom" unit="px" />
                <Inp label="Left" prop="left" unit="px" />
              </div>
              <Inp label="Z-Index" prop="zIndex" />
            </Sec>

            {/* Measures */}
            <Sec id="measures" title="Measures">
              <div className="grid grid-cols-2 gap-2">
                <Inp label="Width" prop="width" unit="px" />
                <Inp label="Height" prop="height" unit="px" />
                <Inp label="Min Width" prop="minWidth" />
                <Inp label="Max Width" prop="maxWidth" />
                <Inp label="Min Height" prop="minHeight" />
                <Inp label="Max Height" prop="maxHeight" />
              </div>
              <Sel label="Display" prop="display" options={['','block','flex','grid','inline','inline-block','inline-flex','none']} />
              <Sel label="Overflow" prop="overflow" options={['','visible','hidden','scroll','auto']} />
              <Sel label="Visibility" prop="visibility" options={['','visible','hidden']} />
            </Sec>

            {/* Transforms */}
            <Sec id="transforms" title="Transforms">
              <Inp label="Transform" prop="transform" />
              <Inp label="Opacity" prop="opacity" />
            </Sec>

            {/* Shadow */}
            <Sec id="shadow" title="Shadow">
              <Inp label="Box Shadow" prop="boxShadow" />
            </Sec>

            {/* Filters */}
            <Sec id="filters" title="Filters">
              <Inp label="Filter" prop="filter" />
            </Sec>

            {/* Transition */}
            <Sec id="transition" title="Transition">
              <Inp label="Property" prop="transitionProperty" />
              <Inp label="Duration" prop="transitionDuration" />
            </Sec>

            {/* Extra */}
            <Sec id="extra" title="Extra (Flex/Grid)">
              <Sel label="Flex Direction" prop="flexDirection" options={['','row','column','row-reverse','column-reverse']} />
              <Sel label="Align Items" prop="alignItems" options={['','stretch','center','flex-start','flex-end','baseline']} />
              <Sel label="Justify" prop="justifyContent" options={['','flex-start','center','flex-end','space-between','space-around','space-evenly']} />
              <Inp label="Gap" prop="gap" />
            </Sec>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="h-7 bg-gray-50 border-t border-gray-200 flex items-center px-4 gap-1 overflow-x-auto shrink-0">
          {breadcrumb.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300 text-[10px]">/</span>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${i===breadcrumb.length-1?'bg-amber-100 text-amber-700 font-semibold':'text-gray-500 hover:text-amber-600 cursor-pointer'}`}>
                {c.tag}{c.cls ? '.' + c.cls : ''}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
