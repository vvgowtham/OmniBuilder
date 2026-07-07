'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Version { id:string; label:string; html:string; ts:string; }

export default function WebsiteEditorPage() {
  const [pageHtml, setPageHtml] = useState('');
  const [pageTitle, setPageTitle] = useState('Untitled');
  const [selInfo, setSelInfo] = useState<{sel:string;tag:string;cls:string}|null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{tag:string;cls:string}>>([]);
  const [styles, setStyles] = useState<Record<string,string>>({});
  const [changeCount, setChangeCount] = useState(0);
  const [saved, setSaved] = useState(true);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVer, setShowVer] = useState(false);
  const [openSec, setOpenSec] = useState<Set<string>>(new Set(['text']));
  const [showNav, setShowNav] = useState(false);
  const [navTree, setNavTree] = useState<any[]>([]);
  const [viewport, setViewport] = useState('100%');
  const [wireframe, setWireframe] = useState(false);
  const [colorPickerActive, setColorPickerActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const elRef = useRef<HTMLElement|null>(null);
  const originalHtmlRef = useRef('');
  const router = useRouter();

  useEffect(() => {
    const ed = localStorage.getItem('editing-page');
    if (ed) { try { const p=JSON.parse(ed); setPageTitle(p.name||''); setPageHtml(p.html||''); originalHtmlRef.current=p.html||''; } catch {} }
    const slug = JSON.parse(localStorage.getItem('editing-page')||'{}').slug||'p';
    const v = localStorage.getItem('yp-ver-'+slug);
    if (v) try { setVersions(JSON.parse(v)); } catch {}
  }, []);

  const toggle = (s:string) => { const n=new Set(openSec); n.has(s)?n.delete(s):n.add(s); setOpenSec(n); };

  const apply = useCallback((prop:string, value:string) => {
    const el = elRef.current;
    if (!el) return;
    (el.style as any)[prop] = value;
    setStyles(p => ({...p, [prop]: value}));
    setChangeCount(c => c+1);
    setSaved(false);
  }, []);

  const readStyles = useCallback((el: HTMLElement) => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    const cs = w.getComputedStyle(el);
    setStyles({
      fontFamily:cs.fontFamily,fontSize:cs.fontSize,fontWeight:cs.fontWeight,fontStyle:cs.fontStyle,
      color:cs.color,textAlign:cs.textAlign,lineHeight:cs.lineHeight,letterSpacing:cs.letterSpacing,
      textDecoration:cs.textDecorationLine||cs.textDecoration,textTransform:cs.textTransform,
      backgroundColor:cs.backgroundColor,backgroundImage:cs.backgroundImage,backgroundSize:cs.backgroundSize,backgroundPosition:cs.backgroundPosition,backgroundRepeat:cs.backgroundRepeat,
      paddingTop:cs.paddingTop,paddingRight:cs.paddingRight,paddingBottom:cs.paddingBottom,paddingLeft:cs.paddingLeft,
      marginTop:cs.marginTop,marginRight:cs.marginRight,marginBottom:cs.marginBottom,marginLeft:cs.marginLeft,
      borderTopWidth:cs.borderTopWidth,borderRightWidth:cs.borderRightWidth,borderBottomWidth:cs.borderBottomWidth,borderLeftWidth:cs.borderLeftWidth,
      borderStyle:cs.borderTopStyle,borderColor:cs.borderTopColor,
      borderTopLeftRadius:cs.borderTopLeftRadius,borderTopRightRadius:cs.borderTopRightRadius,borderBottomRightRadius:cs.borderBottomRightRadius,borderBottomLeftRadius:cs.borderBottomLeftRadius,
      position:cs.position,top:cs.top,right:cs.right,bottom:cs.bottom,left:cs.left,zIndex:cs.zIndex,
      width:cs.width,height:cs.height,minWidth:cs.minWidth,maxWidth:cs.maxWidth,minHeight:cs.minHeight,maxHeight:cs.maxHeight,
      display:cs.display,overflow:cs.overflow,visibility:cs.visibility,opacity:cs.opacity,
      transform:cs.transform,boxShadow:cs.boxShadow,filter:cs.filter,
      transitionProperty:cs.transitionProperty,transitionDuration:cs.transitionDuration,
      flexDirection:cs.flexDirection,alignItems:cs.alignItems,justifyContent:cs.justifyContent,gap:cs.gap,
    });
  }, []);

  const selectEl = useCallback((el: HTMLElement) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll('[data-yp]').forEach(x => { (x as HTMLElement).style.outline=''; x.removeAttribute('data-yp'); });
    el.setAttribute('data-yp','1');
    el.style.outline = '2px solid #f59e0b';
    elRef.current = el;
    const tag=el.tagName.toLowerCase();
    const cls=Array.from(el.classList).filter(c=>c!=='').slice(0,2).join('.');
    setSelInfo({sel:tag+(cls?'.'+cls:''),tag,cls});
    const crumbs:{tag:string;cls:string}[]=[];
    let c:HTMLElement|null=el;
    while(c&&c!==doc.body){crumbs.unshift({tag:c.tagName.toLowerCase(),cls:Array.from(c.classList).slice(0,1).join('')});c=c.parentElement;}
    crumbs.unshift({tag:'body',cls:''});
    setBreadcrumb(crumbs);
    readStyles(el);
  }, [readStyles]);

  const onLoad = () => {
    const iframe=iframeRef.current; if(!iframe||!iframe.contentDocument) return;
    const doc=iframe.contentDocument;
    doc.addEventListener('click',(e:MouseEvent)=>{ if(colorPickerActive)return; e.preventDefault();e.stopPropagation(); const t=e.target as HTMLElement; if(t&&t!==doc.body&&t!==doc.documentElement)selectEl(t); },true);
    doc.addEventListener('mouseover',(e:MouseEvent)=>{ const t=e.target as HTMLElement; if(t&&!t.hasAttribute('data-yp')&&t!==doc.body)t.style.outline='1px dashed rgba(245,158,11,0.5)'; },true);
    doc.addEventListener('mouseout',(e:MouseEvent)=>{ const t=e.target as HTMLElement; if(t&&!t.hasAttribute('data-yp'))t.style.outline=''; },true);
    buildNav(doc.body);
    if(wireframe) applyWireframe(doc, true);
  };

  const buildNav = (root:HTMLElement) => {
    const b=(el:HTMLElement,d:number):any=>{ if(d>5)return null; return{tag:el.tagName.toLowerCase(),cls:Array.from(el.classList).slice(0,1).join(''),el,children:Array.from(el.children).slice(0,25).map(c=>b(c as HTMLElement,d+1)).filter(Boolean)}; };
    setNavTree(Array.from(root.children).map(c=>b(c as HTMLElement,0)).filter(Boolean));
  };

  const applyWireframe = (doc:Document, on:boolean) => {
    let s = doc.getElementById('yp-wireframe');
    if(on){ if(!s){s=doc.createElement('style');s.id='yp-wireframe';doc.head.appendChild(s);} s.textContent='*{background:transparent!important;background-image:none!important;color:#333!important;border-color:#ccc!important;box-shadow:none!important;text-shadow:none!important} img,video,svg{opacity:0.2!important} *{outline:1px solid rgba(0,0,0,0.08)!important}'; }
    else{ if(s)s.remove(); }
  };

  const toggleWireframe = () => {
    const next=!wireframe; setWireframe(next);
    const doc=iframeRef.current?.contentDocument; if(doc) applyWireframe(doc,next);
  };

  const saveAll = () => {
    const iframe=iframeRef.current; if(!iframe||!iframe.contentDocument) return;
    const doc=iframe.contentDocument;
    doc.querySelectorAll('[data-yp]').forEach(x=>{(x as HTMLElement).style.outline='';x.removeAttribute('data-yp');});
    const ws=doc.getElementById('yp-wireframe'); if(ws)ws.remove();
    const html='<!DOCTYPE html>'+doc.documentElement.outerHTML;
    const slug=JSON.parse(localStorage.getItem('editing-page')||'{}').slug||'p';
    const ver:Version={id:'v'+Date.now(),label:'Save '+(versions.length+1),html,ts:new Date().toISOString()};
    const nv=[...versions,ver]; setVersions(nv);
    localStorage.setItem('yp-ver-'+slug,JSON.stringify(nv));
    const ed=JSON.parse(localStorage.getItem('editing-page')||'{}'); ed.html=html;
    localStorage.setItem('editing-page',JSON.stringify(ed));
    const projects=JSON.parse(localStorage.getItem('imported-projects')||'[]');
    for(const proj of projects){const i=(proj.pages||[]).findIndex((p:any)=>p.slug===ed.slug);if(i>=0){proj.pages[i].html=html;break;}}
    localStorage.setItem('imported-projects',JSON.stringify(projects));
    setSaved(true); setChangeCount(0);
    setTimeout(()=>{if(elRef.current)selectEl(elRef.current);if(wireframe&&doc)applyWireframe(doc,true);},50);
  };

  const revertTo = (v:Version) => { setPageHtml(v.html); setShowVer(false); setSaved(false); setChangeCount(0); };
  const resetOriginal = () => { if(!confirm('Reset to original?'))return; if(originalHtmlRef.current){setPageHtml(originalHtmlRef.current);setSaved(false);setChangeCount(0);} };

  const toHex=(c:string):string=>{ if(!c||c==='transparent'||c.includes('rgba(0, 0, 0, 0)'))return'#ffffff'; if(c.startsWith('#'))return c; const m=c.match(/\d+/g); if(!m||m.length<3)return'#000000'; return'#'+m.slice(0,3).map(n=>parseInt(n).toString(16).padStart(2,'0')).join(''); };

  // Property components - color picker uses onMouseDown to prevent iframe click
  const ColorField=({label,prop}:{label:string;prop:string})=>(
    <div onMouseDown={e=>e.stopPropagation()}>
      <label className="text-[11px] text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2" onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
        <input type="color" value={toHex(styles[prop]||'')} onFocus={()=>setColorPickerActive(true)} onBlur={()=>setTimeout(()=>setColorPickerActive(false),200)} onChange={e=>{e.stopPropagation();apply(prop,e.target.value);}} onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} className="w-10 h-8 rounded border border-gray-300 cursor-pointer p-0.5 bg-white" style={{WebkitAppearance:'none'}}/>
        <input value={styles[prop]||''} onChange={e=>apply(prop,e.target.value)} className="flex-1 h-8 rounded-md border border-gray-300 px-2 text-[12px] text-gray-800 focus:border-amber-500 focus:outline-none"/>
      </div>
    </div>
  );

  const Field=({label,prop,unit}:{label:string;prop:string;unit?:string})=>(
    <div><label className="text-[11px] text-gray-500 block mb-1">{label}</label><div className="flex items-center gap-1"><input value={styles[prop]||''} onChange={e=>apply(prop,e.target.value)} className="flex-1 h-8 rounded-md border border-gray-300 px-2 text-[12px] text-gray-800 focus:border-amber-500 focus:outline-none"/>{unit&&<span className="text-[10px] text-gray-400">{unit}</span>}</div></div>
  );

  const SelectField=({label,prop,options}:{label:string;prop:string;options:string[]})=>(
    <div><label className="text-[11px] text-gray-500 block mb-1">{label}</label><select value={styles[prop]||''} onChange={e=>apply(prop,e.target.value)} className="w-full h-8 rounded-md border border-gray-300 px-2 text-[12px] text-gray-800 focus:border-amber-500 focus:outline-none">{options.map(o=><option key={o} value={o}>{o||'inherit'}</option>)}</select></div>
  );

  const Sec=({id,title,children}:{id:string;title:string;children:React.ReactNode})=>(
    <div className="border-b border-gray-200"><button onClick={()=>toggle(id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"><span className="text-[13px] font-semibold text-gray-800">{title}</span><span className="text-gray-400 text-xs">{openSec.has(id)?'^':'v'}</span></button>{openSec.has(id)&&<div className="px-4 pb-4 space-y-3">{children}</div>}</div>
  );

  const NavItem=({node,depth}:{node:any;depth:number})=>(<div><div onClick={()=>{if(node.el)selectEl(node.el);}} style={{paddingLeft:(depth*12+8)+'px'}} className="py-1 px-2 text-[11px] text-gray-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer rounded flex items-center gap-1"><span className="text-gray-400 text-[9px]">{node.children?.length>0?'v':'.'}</span><span className="font-medium">{node.tag}</span>{node.cls&&<span className="text-gray-400 text-[9px]">.{node.cls}</span>}</div>{node.children?.slice(0,15).map((c:any,i:number)=><NavItem key={i} node={c} depth={depth+1}/>)}</div>);

  return (
    <div className="h-screen flex flex-col bg-white" onMouseDown={()=>{if(!colorPickerActive){}}}>
      {/* Top bar */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={()=>router.push('/pages')} className="text-amber-600 text-[12px] font-semibold">Back</button>
          <span className="text-[12px] font-semibold text-gray-800">{pageTitle}</span>
          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Visual CSS Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 font-medium">{changeCount} changes</span>
          <button onClick={()=>setShowVer(!showVer)} className="text-[11px] text-gray-600 hover:text-amber-600 font-medium">Versions ({versions.length})</button>
          <button onClick={resetOriginal} className="text-[11px] text-red-500 hover:text-red-700 font-medium">Reset</button>
          <span className={`text-[11px] font-semibold ${saved?'text-green-600':'text-amber-600'}`}>{saved?'Saved':'Unsaved'}</span>
          <button onClick={saveAll} className="h-7 px-4 rounded-md bg-amber-500 text-white text-[11px] font-bold hover:bg-amber-600">Save</button>
        </div>
      </div>

      {/* Responsive bar */}
      <div className="h-7 bg-gray-100 border-b border-gray-200 flex items-center justify-center gap-2 shrink-0">
        {[{l:'Desktop',w:'100%'},{l:'Tablet',w:'768px'},{l:'Mobile',w:'375px'}].map(v=>(
          <button key={v.l} onClick={()=>setViewport(v.w)} className={`text-[10px] px-2 py-0.5 rounded ${viewport===v.w?'bg-amber-500 text-white font-semibold':'text-gray-500 hover:bg-gray-200'}`}>{v.l}</button>
        ))}
        <span className="text-[10px] text-gray-400 ml-2">{viewport === '100%' ? 'Full width' : viewport}</span>
        <button onClick={toggleWireframe} className={`text-[10px] px-2 py-0.5 rounded ml-4 ${wireframe?'bg-gray-800 text-white':'text-gray-500 hover:bg-gray-200'}`}>{wireframe?'Normal':'Wireframe'}</button>
      </div>

      {/* Version panel */}
      {showVer&&<div className="absolute top-16 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64"><h4 className="text-[11px] font-bold text-gray-700 mb-2">Versions</h4>{versions.length===0?<p className="text-[10px] text-gray-400">No saves yet</p>:<div className="space-y-1 max-h-48 overflow-y-auto">{versions.map(v=>(<div key={v.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50"><div><div className="text-[11px] font-medium">{v.label}</div><div className="text-[9px] text-gray-400">{new Date(v.ts).toLocaleString()}</div></div><button onClick={()=>revertTo(v)} className="text-[9px] text-amber-600 font-semibold">Revert</button></div>))}</div>}<button onClick={()=>setShowVer(false)} className="mt-2 text-[10px] text-gray-400">Close</button></div>}

      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        <div className="w-10 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-3 gap-2 shrink-0">
          <button onClick={()=>setShowNav(!showNav)} className={`w-7 h-7 rounded-md text-[8px] font-bold flex items-center justify-center ${showNav?'bg-amber-500 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'}`} title="Navigator">N</button>
          <button onClick={toggleWireframe} className={`w-7 h-7 rounded-md text-[8px] font-bold flex items-center justify-center ${wireframe?'bg-gray-800 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'}`} title="Wireframe">W</button>
          <button className="w-7 h-7 rounded-md bg-white border border-gray-200 text-gray-600 text-[8px] font-bold flex items-center justify-center hover:border-amber-400" title="Undo" onClick={()=>{if(versions.length>0)revertTo(versions[versions.length-1])}}>U</button>
        </div>

        {/* Navigator */}
        {showNav&&<div className="w-52 bg-white border-r border-gray-200 overflow-y-auto p-2"><h4 className="text-[11px] font-bold text-gray-700 px-2 mb-2">Navigator</h4>{navTree.map((n,i)=><NavItem key={i} node={n} depth={0}/>)}</div>}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden flex justify-center bg-gray-100">
          <div style={{width:viewport,maxWidth:'100%',height:'100%'}}>
            {pageHtml?<iframe ref={iframeRef} srcDoc={pageHtml} className="w-full h-full border-0 bg-white" onLoad={onLoad}/>:<div className="flex items-center justify-center h-full text-gray-400"><p>No page loaded</p></div>}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[270px] bg-white border-l border-gray-200 flex flex-col overflow-hidden" onMouseDown={e=>e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            {selInfo?<div><div className="text-[11px] font-mono text-amber-600 font-semibold truncate">{selInfo.sel}</div><div className="text-[10px] text-gray-400">Tag: {selInfo.tag}</div></div>:<div className="text-[11px] text-gray-400">Click any element to select</div>}
          </div>
          <div className="flex-1 overflow-y-auto" onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
            <Sec id="text" title="Text">
              <Field label="Font Family" prop="fontFamily"/>
              <ColorField label="Color" prop="color"/>
              <div className="grid grid-cols-2 gap-2"><Field label="Font Size" prop="fontSize" unit="px"/><SelectField label="Weight" prop="fontWeight" options={['','100','200','300','400','500','600','700','800','900']}/></div>
              <Field label="Line Height" prop="lineHeight"/>
              <div className="grid grid-cols-2 gap-2"><SelectField label="Style" prop="fontStyle" options={['','normal','italic']}/><SelectField label="Transform" prop="textTransform" options={['','none','uppercase','lowercase','capitalize']}/></div>
              <div className="grid grid-cols-2 gap-2"><SelectField label="Decoration" prop="textDecoration" options={['','none','underline','line-through','overline']}/><SelectField label="Align" prop="textAlign" options={['','left','center','right','justify']}/></div>
              <Field label="Letter Spacing" prop="letterSpacing"/>
            </Sec>
            <Sec id="background" title="Background">
              <ColorField label="Background Color" prop="backgroundColor"/>
              <Field label="Image" prop="backgroundImage"/>
              <div className="grid grid-cols-2 gap-2"><SelectField label="Size" prop="backgroundSize" options={['','auto','cover','contain']}/><SelectField label="Repeat" prop="backgroundRepeat" options={['','repeat','no-repeat','repeat-x','repeat-y']}/></div>
              <Field label="Position" prop="backgroundPosition"/>
            </Sec>
            <Sec id="spacings" title="Spacings">
              <p className="text-[10px] text-gray-500 font-semibold">Padding</p>
              <div className="grid grid-cols-2 gap-2"><Field label="Top" prop="paddingTop" unit="px"/><Field label="Right" prop="paddingRight" unit="px"/><Field label="Bottom" prop="paddingBottom" unit="px"/><Field label="Left" prop="paddingLeft" unit="px"/></div>
              <p className="text-[10px] text-gray-500 font-semibold mt-2">Margin</p>
              <div className="grid grid-cols-2 gap-2"><Field label="Top" prop="marginTop" unit="px"/><Field label="Right" prop="marginRight" unit="px"/><Field label="Bottom" prop="marginBottom" unit="px"/><Field label="Left" prop="marginLeft" unit="px"/></div>
            </Sec>
            <Sec id="borders" title="Borders">
              <ColorField label="Border Color" prop="borderColor"/>
              <SelectField label="Style" prop="borderStyle" options={['','none','solid','dashed','dotted','double']}/>
              <div className="grid grid-cols-2 gap-2"><Field label="Top" prop="borderTopWidth" unit="px"/><Field label="Right" prop="borderRightWidth" unit="px"/><Field label="Bottom" prop="borderBottomWidth" unit="px"/><Field label="Left" prop="borderLeftWidth" unit="px"/></div>
            </Sec>
            <Sec id="radius" title="Border Radius">
              <div className="grid grid-cols-2 gap-2"><Field label="Top Left" prop="borderTopLeftRadius" unit="px"/><Field label="Top Right" prop="borderTopRightRadius" unit="px"/><Field label="Bot Left" prop="borderBottomLeftRadius" unit="px"/><Field label="Bot Right" prop="borderBottomRightRadius" unit="px"/></div>
            </Sec>
            <Sec id="positioning" title="Positioning">
              <SelectField label="Position" prop="position" options={['','static','relative','absolute','fixed','sticky']}/>
              <div className="grid grid-cols-2 gap-2"><Field label="Top" prop="top" unit="px"/><Field label="Right" prop="right" unit="px"/><Field label="Bottom" prop="bottom" unit="px"/><Field label="Left" prop="left" unit="px"/></div>
              <Field label="Z-Index" prop="zIndex"/>
            </Sec>
            <Sec id="measures" title="Measures">
              <div className="grid grid-cols-2 gap-2"><Field label="Width" prop="width"/><Field label="Height" prop="height"/><Field label="Min W" prop="minWidth"/><Field label="Max W" prop="maxWidth"/><Field label="Min H" prop="minHeight"/><Field label="Max H" prop="maxHeight"/></div>
              <SelectField label="Display" prop="display" options={['','block','flex','grid','inline','inline-block','inline-flex','none']}/>
              <SelectField label="Overflow" prop="overflow" options={['','visible','hidden','scroll','auto']}/>
            </Sec>
            <Sec id="transforms" title="Transforms"><Field label="Transform" prop="transform"/><Field label="Opacity" prop="opacity"/></Sec>
            <Sec id="shadow" title="Shadow"><Field label="Box Shadow" prop="boxShadow"/></Sec>
            <Sec id="filters" title="Filters"><Field label="Filter" prop="filter"/></Sec>
            <Sec id="transition" title="Transition"><Field label="Property" prop="transitionProperty"/><Field label="Duration" prop="transitionDuration"/></Sec>
            <Sec id="extra" title="Extra (Flex/Grid)">
              <SelectField label="Flex Direction" prop="flexDirection" options={['','row','column','row-reverse','column-reverse']}/>
              <SelectField label="Align Items" prop="alignItems" options={['','stretch','center','flex-start','flex-end','baseline']}/>
              <SelectField label="Justify" prop="justifyContent" options={['','flex-start','center','flex-end','space-between','space-around','space-evenly']}/>
              <Field label="Gap" prop="gap"/>
            </Sec>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length>0&&<div className="h-7 bg-gray-50 border-t border-gray-200 flex items-center px-4 gap-1 overflow-x-auto shrink-0">{breadcrumb.map((c,i)=>(<span key={i} className="flex items-center gap-1">{i>0&&<span className="text-gray-300 text-[10px]">/</span>}<button onClick={()=>{const doc=iframeRef.current?.contentDocument;if(!doc)return;let el:HTMLElement|null=doc.body;for(let j=1;j<=i;j++){const next=Array.from(el?.children||[]).find(x=>{const t=(x as HTMLElement).tagName.toLowerCase();const cl=Array.from((x as HTMLElement).classList).slice(0,1).join('');return t===breadcrumb[j].tag&&(!breadcrumb[j].cls||cl===breadcrumb[j].cls);}) as HTMLElement|null;if(next)el=next;} if(el&&el!==doc.body)selectEl(el);}} className={`text-[10px] px-1.5 py-0.5 rounded ${i===breadcrumb.length-1?'bg-amber-100 text-amber-700 font-semibold':'text-gray-500 hover:text-amber-600 hover:bg-amber-50'}`}>{c.tag}{c.cls?'.'+c.cls:''}</button></span>))}</div>}
    </div>
  );
}
