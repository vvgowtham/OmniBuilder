'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * YellowPencil-Style Visual CSS Editor
 * 
 * Sections (matching YellowPencil exactly):
 * 1. Text - font-family, color, weight, size, line-height, style, transform, decoration, align, text-shadow
 * 2. Background - color, image, size, position, repeat, blend-mode, clip
 * 3. Spacings (Padding) - top, right, bottom, left
 * 4. Spacings (Margin) - top, right, bottom, left  
 * 5. Borders - width, style, color (per side)
 * 6. Border Radius - top-left, top-right, bottom-right, bottom-left
 * 7. Positioning - position, top, right, bottom, left, z-index, float, clear
 * 8. Measures - width, height, min/max width/height, overflow, display, visibility
 * 9. Transforms - rotate, scale, skew, translate
 * 10. Shadow - box-shadow (color, blur, spread, x, y, inset)
 * 11. Filters - blur, brightness, contrast, grayscale, saturate, opacity
 * 12. Transition - property, duration, timing, delay
 * 13. Extra - display, flex, grid, gap, align, justify, cursor, pointer-events
 * 
 * + Breadcrumb bar at bottom showing element ancestry
 * + Element label on selected element
 * + Left toolbar icons
 */

export default function WebsiteEditorPage() {
  const [pageHtml, setPageHtml] = useState('');
  const [pageTitle, setPageTitle] = useState('Untitled');
  const [selSelector, setSelSelector] = useState('');
  const [selTag, setSelTag] = useState('');
  const [selText, setSelText] = useState('');
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [changes, setChanges] = useState<Array<{sel:string;prop:string;val:string}>>([]);
  const [saved, setSaved] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['text']));
  const [styles, setStyles] = useState<Record<string,string>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  useEffect(() => {
    const editing = localStorage.getItem('editing-page');
    if (editing) {
      try { const p = JSON.parse(editing); setPageTitle(p.name || 'Untitled'); setPageHtml(p.html || ''); } catch {}
    }
  }, []);

  const toggleSection = (s: string) => {
    const next = new Set(openSections);
    next.has(s) ? next.delete(s) : next.add(s);
    setOpenSections(next);
  };

  const onIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;

    const style = doc.createElement('style');
    style.id = 'omni-editor-styles';
    style.textContent = `.omni-sel{outline:2px solid #f59e0b!important;outline-offset:1px}.omni-hov{outline:1px dashed #fbbf24!important;outline-offset:1px}.omni-label{position:absolute;top:-22px;left:0;background:#f59e0b;color:#fff;font-size:11px;padding:1px 8px;border-radius:3px;font-family:system-ui;z-index:99999;pointer-events:none;white-space:nowrap}`;
    doc.head.appendChild(style);

    doc.body.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      const el = e.target as HTMLElement;
      if (!el) return;

      doc.querySelectorAll('.omni-sel').forEach(x => { x.classList.remove('omni-sel'); const lbl = x.querySelector('.omni-label'); if (lbl) lbl.remove(); });
      el.classList.add('omni-sel');
      el.style.position = el.style.position || 'relative';
      const label = doc.createElement('span');
      label.className = 'omni-label';
      const tag = el.tagName.toLowerCase();
      const cls = el.className.split(' ').filter(c => c && !c.startsWith('omni-')).slice(0, 2).join('.');
      label.textContent = tag + (cls ? '.' + cls : '');
      el.appendChild(label);

      // Build selector
      const selector = tag + (cls ? '.' + cls : (el.id ? '#' + el.id : ''));
      setSelSelector(selector);
      setSelTag(tag);
      setSelText(el.textContent?.slice(0, 200) || '');

      // Build breadcrumb
      const crumbs: string[] = [];
      let current: HTMLElement | null = el;
      while (current && current !== doc.body) {
        const t = current.tagName.toLowerCase();
        const c = current.className.split(' ').filter(x => x && !x.startsWith('omni-')).slice(0, 1).join('');
        crumbs.unshift(c ? t + '.' + c : t);
        current = current.parentElement;
      }
      crumbs.unshift('body');
      setBreadcrumb(crumbs);

      // Get computed styles
      const cs = iframe.contentWindow!.getComputedStyle(el);
      setStyles({
        fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
        fontStyle: cs.fontStyle, color: cs.color, textAlign: cs.textAlign,
        lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing,
        textDecoration: cs.textDecoration, textTransform: cs.textTransform, textShadow: cs.textShadow,
        backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage,
        backgroundSize: cs.backgroundSize, backgroundPosition: cs.backgroundPosition,
        backgroundRepeat: cs.backgroundRepeat,
        paddingTop: cs.paddingTop, paddingRight: cs.paddingRight, paddingBottom: cs.paddingBottom, paddingLeft: cs.paddingLeft,
        marginTop: cs.marginTop, marginRight: cs.marginRight, marginBottom: cs.marginBottom, marginLeft: cs.marginLeft,
        borderTopWidth: cs.borderTopWidth, borderRightWidth: cs.borderRightWidth, borderBottomWidth: cs.borderBottomWidth, borderLeftWidth: cs.borderLeftWidth,
        borderStyle: cs.borderStyle, borderColor: cs.borderColor,
        borderTopLeftRadius: cs.borderTopLeftRadius, borderTopRightRadius: cs.borderTopRightRadius, borderBottomRightRadius: cs.borderBottomRightRadius, borderBottomLeftRadius: cs.borderBottomLeftRadius,
        position: cs.position, top: cs.top, right: cs.right, bottom: cs.bottom, left: cs.left, zIndex: cs.zIndex,
        width: cs.width, height: cs.height, minWidth: cs.minWidth, maxWidth: cs.maxWidth, minHeight: cs.minHeight, maxHeight: cs.maxHeight,
        display: cs.display, overflow: cs.overflow, visibility: cs.visibility, opacity: cs.opacity,
        transform: cs.transform, boxShadow: cs.boxShadow, filter: cs.filter,
        transitionProperty: cs.transitionProperty, transitionDuration: cs.transitionDuration, transitionTimingFunction: cs.transitionTimingFunction,
        flexDirection: cs.flexDirection, alignItems: cs.alignItems, justifyContent: cs.justifyContent, gap: cs.gap,
        cursor: cs.cursor,
      });
    });

    doc.body.addEventListener('mouseover', (e: MouseEvent) => { const t = e.target as HTMLElement; if (t && !t.classList.contains('omni-sel')) t.classList.add('omni-hov'); });
    doc.body.addEventListener('mouseout', (e: MouseEvent) => { const t = e.target as HTMLElement; if (t) t.classList.remove('omni-hov'); });
  };

  const applyStyle = (prop: string, value: string) => {
    setStyles(prev => ({...prev, [prop]: value}));
    setSaved(false);
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const el = iframe.contentDocument.querySelector('.omni-sel') as HTMLElement;
    if (el) { (el.style as any)[prop] = value; }
    setChanges(prev => [...prev, {sel: selSelector, prop, val: value}]);
  };

  const editText = (text: string) => {
    setSelText(text);
    setSaved(false);
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const el = iframe.contentDocument.querySelector('.omni-sel') as HTMLElement;
    if (el) { const label = el.querySelector('.omni-label'); el.textContent = text; if (label) el.appendChild(label); }
  };

  const saveAll = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    iframe.contentDocument.querySelectorAll('.omni-sel,.omni-hov').forEach(el => { el.classList.remove('omni-sel','omni-hov'); const l = el.querySelector('.omni-label'); if(l) l.remove(); });
    const editorStyle = iframe.contentDocument.getElementById('omni-editor-styles');
    if (editorStyle) editorStyle.remove();
    const html = '<!DOCTYPE html>' + iframe.contentDocument.documentElement.outerHTML;
    const editing = localStorage.getItem('editing-page');
    if (editing) {
      const page = JSON.parse(editing);
      page.html = html;
      localStorage.setItem('editing-page', JSON.stringify(page));
      const projects = JSON.parse(localStorage.getItem('imported-projects') || '[]');
      for (const proj of projects) { const idx = (proj.pages||[]).findIndex((p:any)=>p.slug===page.slug); if(idx>=0){proj.pages[idx].html=html;break;} }
      localStorage.setItem('imported-projects', JSON.stringify(projects));
    }
    setSaved(true);
    // Re-inject editor styles
    onIframeLoad();
  };

  const exportCSS = () => {
    const grouped: Record<string,Record<string,string>> = {};
    for (const c of changes) { if(!grouped[c.sel]) grouped[c.sel]={}; grouped[c.sel][c.prop]=c.val; }
    let css = '/* OmniBuilder Generated CSS */\n';
    for (const [sel, props] of Object.entries(grouped)) {
      const decls = Object.entries(props).map(([k,v])=>`  ${k.replace(/([A-Z])/g,'-$1').toLowerCase()}: ${v};`).join('\n');
      if (decls) css += `${sel} {\n${decls}\n}\n`;
    }
    const blob = new Blob([css], {type:'text/css'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'styles.css'; a.click();
  };

  // Section renderer
  const Section = ({id, title, children}: {id:string; title:string; children: React.ReactNode}) => (
    <div className="border-b border-gray-800">
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-800/50 transition-all">
        <span className="text-[11px] font-semibold text-gray-200">{title}</span>
        <span className="text-[10px] text-gray-500">{openSections.has(id) ? '-' : '+'}</span>
      </button>
      {openSections.has(id) && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );

  const Field = ({label, prop, type='text'}: {label:string; prop:string; type?:string}) => (
    <div className="flex items-center gap-2">
      <label className="text-[9px] text-gray-400 w-[70px] shrink-0">{label}</label>
      {type === 'color' ? (
        <div className="flex gap-1 flex-1"><input type="color" value={rgbToHex(styles[prop]||'')} onChange={e=>applyStyle(prop,e.target.value)} className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"/><input value={styles[prop]||''} onChange={e=>applyStyle(prop,e.target.value)} className="flex-1 h-6 rounded bg-gray-800 border border-gray-700 px-1.5 text-[10px] text-gray-200 focus:border-amber-500 focus:outline-none"/></div>
      ) : type === 'select' ? null : (
        <input value={styles[prop]||''} onChange={e=>applyStyle(prop,e.target.value)} className="flex-1 h-6 rounded bg-gray-800 border border-gray-700 px-1.5 text-[10px] text-gray-200 focus:border-amber-500 focus:outline-none"/>
      )}
    </div>
  );

  const Select = ({label, prop, options}: {label:string; prop:string; options:string[]}) => (
    <div className="flex items-center gap-2">
      <label className="text-[9px] text-gray-400 w-[70px] shrink-0">{label}</label>
      <select value={styles[prop]||''} onChange={e=>applyStyle(prop,e.target.value)} className="flex-1 h-6 rounded bg-gray-800 border border-gray-700 px-1 text-[10px] text-gray-200 focus:border-amber-500 focus:outline-none">
        {options.map(o => <option key={o} value={o}>{o || 'inherit'}</option>)}
      </select>
    </div>
  );

  function rgbToHex(rgb: string): string {
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#000000';
    return '#' + match.slice(0,3).map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top toolbar */}
      <div className="h-9 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/pages')} className="text-amber-500 text-[11px] font-medium">Back</button>
          <span className="text-gray-600">|</span>
          <span className="text-[11px] text-gray-300 font-medium">{pageTitle}</span>
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-semibold">Visual CSS Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-500">{changes.length} changes</span>
          <span className={`text-[9px] ${saved?'text-green-500':'text-amber-400'}`}>{saved?'Saved':'Unsaved'}</span>
          <button onClick={exportCSS} className="h-6 px-2 rounded bg-gray-800 text-[10px] text-gray-300 font-semibold border border-gray-700 hover:bg-gray-700">Export CSS</button>
          <button onClick={saveAll} className="h-6 px-3 rounded bg-amber-500 text-[10px] text-gray-900 font-bold hover:bg-amber-400">Save</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left icon bar */}
        <div className="w-10 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-2 gap-1 shrink-0">
          <button className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center justify-center" title="Inspector">Ins</button>
          <button className="w-7 h-7 rounded hover:bg-gray-800 text-gray-500 text-[9px] flex items-center justify-center" title="Layers">Ly</button>
          <button className="w-7 h-7 rounded hover:bg-gray-800 text-gray-500 text-[9px] flex items-center justify-center" title="Pages">Pg</button>
          <button className="w-7 h-7 rounded hover:bg-gray-800 text-gray-500 text-[9px] flex items-center justify-center" title="Responsive">Rsp</button>
          <button className="w-7 h-7 rounded hover:bg-gray-800 text-gray-500 text-[9px] flex items-center justify-center" title="Code">Cd</button>
          <button className="w-7 h-7 rounded hover:bg-gray-800 text-gray-500 text-[9px] flex items-center justify-center" title="Info">i</button>
        </div>

        {/* Main canvas */}
        <div className="flex-1 overflow-hidden">
          {pageHtml ? (
            <iframe ref={iframeRef} srcDoc={pageHtml} className="w-full h-full border-0" onLoad={onIframeLoad} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500"><p>No page loaded. Import a website first.</p></div>
          )}
        </div>

        {/* Right panel - YellowPencil style sections */}
        <div className="w-[260px] bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
          {/* Element info */}
          <div className="px-3 py-2 border-b border-gray-800">
            {selSelector ? (
              <div>
                <div className="text-[10px] font-mono text-amber-400 truncate">{selSelector}</div>
                <div className="text-[9px] text-gray-500">Tag: {selTag}</div>
              </div>
            ) : (
              <div className="text-[10px] text-gray-500">Click any element to inspect</div>
            )}
          </div>

          {/* Scrollable sections */}
          <div className="flex-1 overflow-y-auto">
            {/* Text */}
            <Section id="text" title="Text">
              <Field label="Font Family" prop="fontFamily" />
              <Field label="Color" prop="color" type="color" />
              <Field label="Font Size" prop="fontSize" />
              <Select label="Weight" prop="fontWeight" options={['','100','200','300','400','500','600','700','800','900']} />
              <Field label="Line Height" prop="lineHeight" />
              <Select label="Style" prop="fontStyle" options={['','normal','italic','oblique']} />
              <Select label="Transform" prop="textTransform" options={['','none','uppercase','lowercase','capitalize']} />
              <Select label="Decoration" prop="textDecoration" options={['','none','underline','line-through','overline']} />
              <Select label="Align" prop="textAlign" options={['','left','center','right','justify']} />
              <Field label="Letter Sp" prop="letterSpacing" />
              <Field label="Text Shadow" prop="textShadow" />
            </Section>

            {/* Background */}
            <Section id="background" title="Background">
              <Field label="Color" prop="backgroundColor" type="color" />
              <Field label="Image" prop="backgroundImage" />
              <Select label="Size" prop="backgroundSize" options={['','auto','cover','contain']} />
              <Field label="Position" prop="backgroundPosition" />
              <Select label="Repeat" prop="backgroundRepeat" options={['','repeat','no-repeat','repeat-x','repeat-y']} />
            </Section>

            {/* Spacings - Padding */}
            <Section id="padding" title="Spacings (Padding)">
              <Field label="Top" prop="paddingTop" />
              <Field label="Right" prop="paddingRight" />
              <Field label="Bottom" prop="paddingBottom" />
              <Field label="Left" prop="paddingLeft" />
            </Section>

            {/* Spacings - Margin */}
            <Section id="margin" title="Spacings (Margin)">
              <Field label="Top" prop="marginTop" />
              <Field label="Right" prop="marginRight" />
              <Field label="Bottom" prop="marginBottom" />
              <Field label="Left" prop="marginLeft" />
            </Section>

            {/* Borders */}
            <Section id="borders" title="Borders">
              <Field label="Top W" prop="borderTopWidth" />
              <Field label="Right W" prop="borderRightWidth" />
              <Field label="Bottom W" prop="borderBottomWidth" />
              <Field label="Left W" prop="borderLeftWidth" />
              <Select label="Style" prop="borderStyle" options={['','none','solid','dashed','dotted','double','groove','ridge']} />
              <Field label="Color" prop="borderColor" type="color" />
            </Section>

            {/* Border Radius */}
            <Section id="radius" title="Border Radius">
              <Field label="Top Left" prop="borderTopLeftRadius" />
              <Field label="Top Right" prop="borderTopRightRadius" />
              <Field label="Bot Right" prop="borderBottomRightRadius" />
              <Field label="Bot Left" prop="borderBottomLeftRadius" />
            </Section>

            {/* Positioning */}
            <Section id="position" title="Positioning">
              <Select label="Position" prop="position" options={['','static','relative','absolute','fixed','sticky']} />
              <Field label="Top" prop="top" />
              <Field label="Right" prop="right" />
              <Field label="Bottom" prop="bottom" />
              <Field label="Left" prop="left" />
              <Field label="Z-Index" prop="zIndex" />
            </Section>

            {/* Measures */}
            <Section id="measures" title="Measures">
              <Field label="Width" prop="width" />
              <Field label="Height" prop="height" />
              <Field label="Min W" prop="minWidth" />
              <Field label="Max W" prop="maxWidth" />
              <Field label="Min H" prop="minHeight" />
              <Field label="Max H" prop="maxHeight" />
              <Select label="Display" prop="display" options={['','block','flex','grid','inline','inline-block','inline-flex','none']} />
              <Select label="Overflow" prop="overflow" options={['','visible','hidden','scroll','auto']} />
              <Select label="Visibility" prop="visibility" options={['','visible','hidden']} />
            </Section>

            {/* Transforms */}
            <Section id="transforms" title="Transforms">
              <Field label="Transform" prop="transform" />
              <Field label="Opacity" prop="opacity" />
            </Section>

            {/* Shadow */}
            <Section id="shadow" title="Shadow">
              <Field label="Box Shadow" prop="boxShadow" />
            </Section>

            {/* Filters */}
            <Section id="filters" title="Filters">
              <Field label="Filter" prop="filter" />
            </Section>

            {/* Transition */}
            <Section id="transition" title="Transition">
              <Field label="Property" prop="transitionProperty" />
              <Field label="Duration" prop="transitionDuration" />
              <Field label="Timing" prop="transitionTimingFunction" />
            </Section>

            {/* Extra (Flex/Grid) */}
            <Section id="extra" title="Extra (Flex/Grid)">
              <Select label="Flex Dir" prop="flexDirection" options={['','row','column','row-reverse','column-reverse']} />
              <Select label="Align" prop="alignItems" options={['','stretch','center','flex-start','flex-end','baseline']} />
              <Select label="Justify" prop="justifyContent" options={['','flex-start','center','flex-end','space-between','space-around','space-evenly']} />
              <Field label="Gap" prop="gap" />
              <Select label="Cursor" prop="cursor" options={['','auto','pointer','default','move','text','wait','not-allowed','crosshair']} />
            </Section>

            {/* Text Content */}
            {selSelector && (
              <div className="px-3 py-3 border-t border-gray-800">
                <label className="block text-[9px] text-gray-400 font-semibold uppercase mb-1">Text Content</label>
                <textarea value={selText} onChange={e => editText(e.target.value)} className="w-full h-20 rounded bg-gray-800 border border-gray-700 p-2 text-[10px] text-gray-200 resize-none focus:border-amber-500 focus:outline-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb bar */}
      {breadcrumb.length > 0 && (
        <div className="h-7 bg-gray-900 border-t border-gray-800 flex items-center px-3 gap-1 overflow-x-auto shrink-0">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-600 text-[9px]">/</span>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${i === breadcrumb.length - 1 ? 'bg-amber-500/20 text-amber-400 font-semibold' : 'text-gray-400 hover:text-gray-200 cursor-pointer'}`}>{crumb}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
