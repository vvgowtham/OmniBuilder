'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, TEMPLATES, BNode, uid, cloneNode } from './components';

// Simple HTML to builder nodes converter
function htmlToNodes(html: string): BNode[] {
  if (!html || typeof document === 'undefined') return [];
  const nodes: BNode[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    function parseElement(el: Element): BNode | null {
      const tag = el.tagName.toLowerCase();
      if (['script','link','meta','style','head','html','body'].includes(tag)) return null;

      const style: Record<string,string> = {};
      const inlineStyle = el.getAttribute('style');
      if (inlineStyle) {
        inlineStyle.split(';').forEach(s => {
          const [k,v] = s.split(':').map(x=>x.trim());
          if (k && v) {
            const camelKey = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            style[camelKey] = v;
          }
        });
      }

      // Add default styles based on tag
      if (tag === 'section' || tag === 'div' || tag === 'article' || tag === 'main') {
        if (!style.padding) style.padding = '24px';
      }
      if (tag === 'h1') { style.fontSize = style.fontSize || '2.5rem'; style.fontWeight = style.fontWeight || '800'; }
      if (tag === 'h2') { style.fontSize = style.fontSize || '2rem'; style.fontWeight = style.fontWeight || '700'; }
      if (tag === 'h3') { style.fontSize = style.fontSize || '1.5rem'; style.fontWeight = style.fontWeight || '700'; }
      if (tag === 'p') { style.lineHeight = style.lineHeight || '1.6'; }
      if (tag === 'a') { style.color = style.color || '#7c3aed'; style.textDecoration = style.textDecoration || 'underline'; }
      if (tag === 'button' || tag === 'input[type=submit]') {
        style.background = style.background || '#7c3aed'; style.color = style.color || '#fff';
        style.padding = style.padding || '10px 20px'; style.borderRadius = style.borderRadius || '8px';
        style.border = style.border || 'none'; style.fontWeight = style.fontWeight || '600';
      }
      if (tag === 'img') { style.maxWidth = '100%'; style.borderRadius = style.borderRadius || '8px'; }
      if (tag === 'nav') { style.display = style.display || 'flex'; style.padding = style.padding || '16px 24px'; style.alignItems = 'center'; }
      if (tag === 'footer') { style.padding = style.padding || '32px'; style.background = style.background || '#1e293b'; style.color = style.color || '#fff'; }
      if (tag === 'header') { style.padding = style.padding || '16px 24px'; }

      const children: BNode[] = [];
      let textContent = '';

      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === 3) { // Text node
          const t = child.textContent?.trim();
          if (t) textContent += (textContent ? ' ' : '') + t;
        } else if (child.nodeType === 1) {
          const childNode = parseElement(child as Element);
          if (childNode) children.push(childNode);
        }
      }

      const type = ['h1','h2','h3','h4','h5','h6'].includes(tag) ? 'heading' :
                   ['p','span','a','li','label','blockquote','pre','code'].includes(tag) ? 'text' :
                   ['button'].includes(tag) ? 'button' : 'container';

      return {
        id: uid(),
        type,
        tag,
        content: children.length === 0 ? textContent : '',
        styles: style,
        children,
        name: el.className ? el.className.split(' ')[0] : undefined,
      };
    }

    // Parse body children
    for (const child of Array.from(body.children)) {
      const node = parseElement(child);
      if (node) nodes.push(node);
    }
  } catch (e) {
    console.error('HTML parse error:', e);
  }

  return nodes.length > 0 ? nodes : [{
    id: uid(), type: 'section', tag: 'section', content: '',
    styles: {padding:'48px 32px', textAlign:'center'},
    children: [{id:uid(),type:'heading',tag:'h1',content:'Imported Page',styles:{fontSize:'2rem',fontWeight:'700'},children:[]},{id:uid(),type:'text',tag:'p',content:'Edit this page using the visual builder.',styles:{color:'#6b7280'},children:[]}]
  }];
}

export default function VisualBuilderPage() {
  const [nodes, setNodes] = useState<BNode[]>([]);
  const [pageTitle, setPageTitle] = useState('Untitled');
  const [selId, setSelId] = useState<string|null>(null);
  const [bp, setBp] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [tab, setTab] = useState<'components'|'elements'|'templates'|'pages'>('components');
  const [hist, setHist] = useState<BNode[][]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState('');
  const [expCat, setExpCat] = useState<string|null>('Hero');
  const [ctx, setCtx] = useState<{x:number;y:number;id:string}|null>(null);
  const [dragNodes, setDragNodes] = useState<BNode[]|null>(null);
  const [dropTarget, setDropTarget] = useState<{id:string;pos:'before'|'after'|'inside'}|null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string|null>(null);

  // Load page content on mount
  useEffect(() => {
    const editingPage = localStorage.getItem('editing-page');
    if (editingPage) {
      try {
        const page = JSON.parse(editingPage);
        setPageTitle(page.name || 'Untitled');
        if (page.html) {
          // Convert HTML to builder nodes
          const converted = htmlToNodes(page.html);
          setNodes(converted);
          return;
        }
      } catch {}
    }
    // Fallback: load from localStorage
    const s = localStorage.getItem('builder-nodes');
    if (s) try { setNodes(JSON.parse(s)); } catch {}
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('builder-nodes', JSON.stringify(nodes));
      // Also update the editing page
      const editingPage = localStorage.getItem('editing-page');
      if (editingPage) {
        try {
          const page = JSON.parse(editingPage);
          page.builderNodes = nodes;
          localStorage.setItem('editing-page', JSON.stringify(page));
        } catch {}
      }
      setSaved(true);
    }, 600);
    return () => clearTimeout(t);
  }, [nodes]);

  const push = (n: BNode[]) => { const h = hist.slice(0,hIdx+1); h.push(JSON.parse(JSON.stringify(n))); setHist(h); setHIdx(h.length-1); };
  const up = (n: BNode[]) => { setNodes(n); push(n); setSaved(false); };
  const undo = () => { if(hIdx>0){setHIdx(hIdx-1);setNodes(hist[hIdx-1]);} };
  const redo = () => { if(hIdx<hist.length-1){setHIdx(hIdx+1);setNodes(hist[hIdx+1]);} };

  const find = (ns: BNode[], id: string): BNode|null => { for(const n of ns){if(n.id===id)return n;const f=find(n.children,id);if(f)return f;} return null; };
  const findParent = (ns: BNode[], id: string, parent: BNode|null = null): BNode|null => { for(const n of ns){if(n.id===id)return parent;const f=findParent(n.children,id,n);if(f!==undefined&&f!==null)return f;} return null; };
  const upd = (ns: BNode[], id: string, fn:(n:BNode)=>BNode): BNode[] => ns.map(n=>n.id===id?fn(n):{...n,children:upd(n.children,id,fn)});
  const del = (ns: BNode[], id: string): BNode[] => ns.filter(n=>n.id!==id).map(n=>({...n,children:del(n.children,id)}));
  const insertAfter = (ns: BNode[], tid: string, nn: BNode[]): BNode[] => { const r:BNode[]=[]; for(const n of ns){r.push({...n,children:insertAfter(n.children,tid,nn)});if(n.id===tid)r.push(...nn);} return r; };

  const sel = selId ? find(nodes, selId) : null;

  const addAt = (cn: BNode[], target?: {id:string;pos:'before'|'after'|'inside'}) => {
    const cloned = cn.map(cloneNode);
    if(target) {
      if(target.pos==='inside') up(upd(nodes,target.id,n=>({...n,children:[...n.children,...cloned]})));
      else if(target.pos==='after') up(insertAfter(nodes,target.id,cloned));
      else up(nodes); // before - simplified
    } else up([...nodes,...cloned]);
  };

  const applyTpl = (name: string) => {
    const names = TEMPLATES[name]; if(!names) return;
    const all: BNode[] = [];
    for(const n of names){ for(const cat of Object.values(CATEGORIES)){ const c=cat.find(x=>x.name===n); if(c){all.push(...c.nodes.map(cloneNode));break;} } }
    up(all);
  };

  const moveInSiblings = (id: string, dir: -1|1) => {
    const parent = findParent(nodes, id, null);
    if(parent){ const s=[...parent.children]; const i=s.findIndex(n=>n.id===id); const ni=i+dir; if(ni<0||ni>=s.length)return; [s[i],s[ni]]=[s[ni],s[i]]; up(upd(nodes,parent.id,n=>({...n,children:s}))); }
    else{ const i=nodes.findIndex(n=>n.id===id); const ni=i+dir; if(ni<0||ni>=nodes.length)return; const a=[...nodes]; [a[i],a[ni]]=[a[ni],a[i]]; up(a); }
  };

  const doDelete = () => { if(!selId)return; up(del(nodes,selId)); setSelId(null); };
  const doDuplicate = () => { if(!selId)return; const n=find(nodes,selId); if(!n)return; const c=cloneNode(n); up(insertAfter(nodes,selId,[c])); setSelId(c.id); };
  const doLock = () => { if(!selId)return; up(upd(nodes,selId,n=>({...n,locked:!n.locked}))); };
  const doHide = () => { if(!selId)return; up(upd(nodes,selId,n=>({...n,hidden:!n.hidden}))); };
  const doUnhide = (id:string) => { up(upd(nodes,id,n=>({...n,hidden:false}))); };
  const doWrap = () => { if(!selId)return; const n=find(nodes,selId); if(!n)return; const w:BNode={id:uid(),type:'container',tag:'div',content:'',name:'Container',styles:{padding:'16px'},children:[{...n}]}; up([...del(nodes,selId),w]); setSelId(w.id); };
  const doAddChild = (pid?:string) => { const id=pid||selId; if(!id)return; const c:BNode={id:uid(),type:'container',tag:'div',content:'',name:'Block',styles:{padding:'12px',background:'#f9fafb',borderRadius:'6px',minHeight:'40px'},children:[]}; up(upd(nodes,id,n=>({...n,children:[...n.children,c]}))); };

  const styl = (p:string,v:string) => { if(!selId)return; up(upd(nodes,selId,n=>({...n,styles:{...n.styles,[p]:v}}))); };
  const cont = (v:string) => { if(!selId)return; up(upd(nodes,selId,n=>({...n,content:v}))); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
      if((e.target as HTMLElement).isContentEditable)return;
      if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo();}
      if((e.metaKey||e.ctrlKey)&&e.key==='d'){e.preventDefault();doDuplicate();}
      if(e.key==='Delete'||e.key==='Backspace'){if(selId)doDelete();}
      if(e.key==='Escape'){setSelId(null);setCtx(null);setShowAddMenu(null);}
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  });

  const handleDrop = (e: React.DragEvent, tid?:string, pos?:'before'|'after'|'inside') => {
    e.preventDefault();e.stopPropagation();setDropTarget(null);
    if(dragNodes){if(tid&&pos)addAt(dragNodes,{id:tid,pos});else addAt(dragNodes);setDragNodes(null);}
  };

  const renderNode = (node: BNode): React.ReactNode => {
    if(node.hidden) return <div key={node.id} style={{opacity:0.3,padding:'4px 8px',border:'1px dashed #d1d5db',borderRadius:'4px',margin:'2px',fontSize:'10px',color:'#9ca3af',display:'flex',justifyContent:'space-between'}}><span>Hidden: {node.name||node.type}</span><button onClick={e=>{e.stopPropagation();doUnhide(node.id);}} style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:'4px',padding:'1px 6px',fontSize:'9px',cursor:'pointer'}}>Show</button></div>;
    const isSel=selId===node.id;
    const isDrop=dropTarget?.id===node.id;
    const style:React.CSSProperties={...(node.styles as any),cursor:node.locked?'not-allowed':'pointer',outline:isSel?'2px solid #7c3aed':isDrop?'2px dashed #a78bfa':undefined,outlineOffset:'2px',position:'relative' as const,minHeight:!node.content&&node.children.length===0?'40px':undefined};

    return (
      <div key={node.id}>
        {isDrop&&dropTarget?.pos==='before'&&<div style={{height:'3px',background:'#7c3aed',borderRadius:'2px',margin:'2px 0'}}/>}
        <div style={style} onClick={e=>{e.stopPropagation();if(!node.locked)setSelId(node.id);}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setSelId(node.id);setCtx({x:e.clientX,y:e.clientY,id:node.id});}} draggable={!node.locked} onDragStart={e=>{e.stopPropagation();setDragNodes([node]);}} onDragEnd={()=>setDragNodes(null)} onDragOver={e=>{e.preventDefault();e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();const y=e.clientY-r.top;setDropTarget({id:node.id,pos:y<r.height*0.3?'before':y>r.height*0.7?'after':'inside'});}} onDrop={e=>handleDrop(e,node.id,dropTarget?.id===node.id?dropTarget.pos:'inside')} onDragLeave={()=>setDropTarget(null)}>
          {isSel&&<div style={{position:'absolute',top:'-34px',left:'0',display:'flex',gap:'2px',zIndex:50,background:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',padding:'3px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>moveInSiblings(node.id,-1)} title="Up" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#eef2ff',color:'#4f46e5',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>&#8593;</button>
            <button onClick={()=>moveInSiblings(node.id,1)} title="Down" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#eef2ff',color:'#4f46e5',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>&#8595;</button>
            <button onClick={doDuplicate} title="Duplicate" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#f0fdf4',color:'#16a34a',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>++</button>
            <button onClick={doLock} title="Lock" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:node.locked?'#fef3c7':'#f5f5f5',color:node.locked?'#d97706':'#6b7280',cursor:'pointer',fontSize:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>Lk</button>
            <button onClick={doHide} title="Hide" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#f5f5f5',color:'#6b7280',cursor:'pointer',fontSize:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>Hd</button>
            <button onClick={()=>doAddChild(node.id)} title="Add" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#ecfdf5',color:'#059669',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            <button onClick={doDelete} title="Delete" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>X</button>
          </div>}
          {node.content&&<span contentEditable={!node.locked} suppressContentEditableWarning onBlur={e=>{if(!node.locked){const c=e.currentTarget.textContent||'';setNodes(p=>upd(p,node.id,n=>({...n,content:c})));setSaved(false);}}}>{node.content}</span>}
          {node.children.map(renderNode)}
          {node.children.length===0&&!node.content&&node.type==='container'&&<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',minHeight:'40px'}}><button onClick={e=>{e.stopPropagation();setShowAddMenu(showAddMenu===node.id?null:node.id);}} style={{width:'28px',height:'28px',borderRadius:'50%',border:'2px dashed #d1d5db',background:'#fff',color:'#7c3aed',cursor:'pointer',fontSize:'16px'}}>+</button></div>}
          {showAddMenu===node.id&&<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:60,background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'8px',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',width:'180px',maxHeight:'250px',overflow:'auto'}} onClick={e=>e.stopPropagation()}>{Object.entries(CATEGORIES).slice(0,5).map(([cat,comps])=>(<div key={cat}><p style={{fontSize:'9px',fontWeight:'700',color:'#9ca3af',padding:'2px 4px'}}>{cat}</p>{comps.slice(0,3).map(c=>(<button key={c.name} onClick={()=>{addAt(c.nodes,{id:node.id,pos:'inside'});setShowAddMenu(null);}} style={{width:'100%',textAlign:'left',padding:'3px 6px',border:'none',background:'transparent',fontSize:'10px',borderRadius:'4px',cursor:'pointer'}}>{c.name}</button>))}</div>))}</div>}
        </div>
        {isDrop&&dropTarget?.pos==='after'&&<div style={{height:'3px',background:'#7c3aed',borderRadius:'2px',margin:'2px 0'}}/>}
      </div>
    );
  };

  const renderLayer = (node:BNode,d:number):React.ReactNode=>(<div key={node.id} style={{marginLeft:d*10+'px'}}><div className={`flex items-center gap-1 py-[3px] px-1 rounded group ${selId===node.id?'bg-purple-100 text-purple-700':'text-gray-600 hover:bg-gray-50'} ${node.hidden?'opacity-40':''}`}><button onClick={()=>setSelId(node.id)} className="flex-1 text-left truncate text-[10px] cursor-pointer">{node.children.length>0?'v ':'. '}{node.name||node.type}{node.content?': '+node.content.slice(0,12):''}</button><div className="hidden group-hover:flex gap-[2px]"><button onClick={()=>{setSelId(node.id);doAddChild(node.id);}} className="w-4 h-4 rounded text-[8px]" style={{background:'#ecfdf5',color:'#059669'}}>+</button><button onClick={()=>{setSelId(node.id);doDuplicate();}} className="w-4 h-4 rounded text-[8px]" style={{background:'#f0fdf4',color:'#16a34a'}}>D</button><button onClick={()=>{if(node.hidden)doUnhide(node.id);else{setSelId(node.id);doHide();}}} className="w-4 h-4 rounded text-[8px]" style={{background:node.hidden?'#dbeafe':'#f5f5f5',color:node.hidden?'#2563eb':'#9ca3af'}}>{node.hidden?'S':'H'}</button><button onClick={()=>{setSelId(node.id);doDelete();}} className="w-4 h-4 rounded text-[8px]" style={{background:'#fef2f2',color:'#dc2626'}}>X</button></div></div>{node.children.map(c=>renderLayer(c,d+1))}</div>);

  const PROPS:[string,string][]=[['fontSize','Size'],['fontWeight','Weight'],['color','Color'],['background','BG'],['padding','Pad'],['margin','Margin'],['borderRadius','Radius'],['border','Border'],['boxShadow','Shadow'],['opacity','Opacity'],['width','W'],['height','H'],['maxWidth','Max W'],['display','Display'],['flexDirection','Flex'],['alignItems','Align'],['justifyContent','Justify'],['gap','Gap'],['gridTemplateColumns','Grid'],['position','Pos'],['zIndex','Z'],['overflow','Overflow'],['transform','Transform'],['transition','Transition'],['lineHeight','LH'],['letterSpacing','LS'],['textDecoration','Deco']];

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-sm" onClick={()=>{setCtx(null);setShowAddMenu(null);}}>
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 h-10 shrink-0">
        <div className="flex items-center gap-2"><Link href="/pages" className="text-purple-600 font-medium text-xs">Back</Link><span className="text-gray-300">|</span><span className="text-xs text-gray-700 font-semibold">{pageTitle}</span></div>
        <div className="flex items-center gap-1">{(['desktop','tablet','mobile'] as const).map(b=>(<button key={b} onClick={()=>setBp(b)} className={`px-2 h-7 rounded text-[10px] font-semibold ${bp===b?'bg-purple-600 text-white':'bg-gray-100 text-gray-600'}`}>{b[0].toUpperCase()}</button>))}<span className="w-px h-4 bg-gray-200 mx-1"/><button onClick={undo} className="px-2 h-7 rounded bg-gray-100 text-[10px] font-semibold">Undo</button><button onClick={redo} className="px-2 h-7 rounded bg-gray-100 text-[10px] font-semibold">Redo</button></div>
        <div className="flex items-center gap-2"><span className={`text-[10px] font-medium ${saved?'text-green-600':'text-orange-500'}`}>{saved?'Saved':'Unsaved'}</span><button className="h-7 px-3 rounded bg-gray-100 text-[10px] font-semibold">Preview</button><button className="h-7 px-3 rounded bg-purple-600 text-white text-[10px] font-semibold">Publish</button></div>
      </div>
      <div className="flex-1 grid grid-cols-[220px_1fr_240px] overflow-hidden">
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">{(['components','elements','templates','pages'] as const).map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex-1 py-1.5 text-[9px] font-semibold capitalize ${tab===t?'text-purple-700 border-b-2 border-purple-600':'text-gray-500'}`}>{t}</button>))}</div>
          <div className="flex-1 overflow-y-auto p-2">
            {tab==='components'&&<div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full h-6 rounded border border-gray-200 px-2 text-[10px] mb-2 focus:border-purple-500 focus:outline-none"/>{Object.entries(CATEGORIES).filter(([c])=>!search||c.toLowerCase().includes(search.toLowerCase())).map(([cat,comps])=>(<div key={cat} className="mb-0.5"><button onClick={()=>setExpCat(expCat===cat?null:cat)} className="w-full flex justify-between items-center px-2 py-1 rounded text-[10px] font-semibold text-gray-700 hover:bg-gray-50">{cat}<span className="text-[9px] text-gray-400">{comps.length}</span></button>{expCat===cat&&<div className="pl-1 space-y-0.5">{comps.map(c=>(<div key={c.name} draggable onDragStart={()=>setDragNodes(c.nodes)} onDragEnd={()=>setDragNodes(null)} onClick={()=>addAt(c.nodes)} className="px-2 py-1 rounded text-[10px] text-gray-600 hover:bg-purple-50 hover:text-purple-700 cursor-grab border border-transparent hover:border-purple-200">{c.name}</div>))}</div>}</div>))}</div>}
            {tab==='elements'&&<div className="space-y-0.5">{Object.entries(CATEGORIES).flatMap(([,c])=>c).slice(0,25).map(el=>(<div key={el.name} draggable onDragStart={()=>setDragNodes(el.nodes)} onDragEnd={()=>setDragNodes(null)} onClick={()=>addAt(el.nodes)} className="px-2 py-1 rounded text-[10px] text-gray-700 hover:bg-purple-50 cursor-grab">{el.name}</div>))}</div>}
            {tab==='templates'&&<div className="space-y-1">{Object.keys(TEMPLATES).map(n=>(<button key={n} onClick={()=>{if(nodes.length>0&&!confirm('Replace?'))return;applyTpl(n);}} className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50"><div className="text-[10px] font-semibold">{n}</div><div className="text-[9px] text-gray-400">{TEMPLATES[n].length} sections</div></button>))}</div>}
            {tab==='pages'&&<div className="p-2"><Link href="/pages" className="text-[10px] text-purple-600 font-semibold">Open Pages Manager</Link></div>}
          </div>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col items-center" onClick={()=>{setSelId(null);setShowAddMenu(null);}} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e)}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all ${bp==='desktop'?'w-full max-w-[1200px]':bp==='tablet'?'w-[768px]':'w-[375px]'}`} style={{minHeight:'100%'}}>
            {nodes.length>0?nodes.map(renderNode):<div className="flex flex-col items-center justify-center h-80 text-gray-400"><p className="font-medium">Empty Canvas</p><p className="text-xs mt-1">Drag components or apply a template</p></div>}
          </div>
        </div>
        <div className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase mb-1">Properties</h4>
            {sel?(<div className="space-y-1.5"><div className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{sel.name||sel.type} ({sel.tag})</div>{sel.content!==undefined&&<div><label className="block text-[8px] font-semibold text-gray-500 uppercase">Content</label><textarea value={sel.content} onChange={e=>cont(e.target.value)} className="w-full h-10 rounded border border-gray-200 p-1 text-[10px] resize-none focus:border-purple-500 focus:outline-none"/></div>}{PROPS.map(([k,l])=>(<div key={k}><label className="block text-[8px] font-semibold text-gray-500 uppercase">{l}</label><input value={(sel.styles as any)[k]||''} onChange={e=>styl(k,e.target.value)} className="w-full h-5 rounded border border-gray-200 px-1 text-[10px] focus:border-purple-500 focus:outline-none"/></div>))}<div className="pt-1 border-t border-gray-100 grid grid-cols-3 gap-0.5"><button onClick={doDuplicate} className="h-5 rounded text-[8px] font-semibold" style={{background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0'}}>Dup</button><button onClick={doHide} className="h-5 rounded text-[8px]" style={{background:'#f5f5f5',border:'1px solid #e5e7eb'}}>{sel.hidden?'Show':'Hide'}</button><button onClick={doDelete} className="h-5 rounded text-[8px]" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>Del</button></div></div>):(<p className="text-[10px] text-gray-400 mt-2">Select an element to edit</p>)}
          </div>
          <div className="border-t border-gray-200 h-[200px] overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase mb-1">Layers</h4>
            {nodes.length===0?<p className="text-[9px] text-gray-400">Empty</p>:nodes.map(n=>renderLayer(n,0))}
          </div>
        </div>
      </div>
      {ctx&&<div style={{position:'fixed',top:ctx.y,left:ctx.x,zIndex:9999}} className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[150px]" onClick={e=>e.stopPropagation()}><button onClick={()=>{doDuplicate();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-purple-50">Duplicate</button><button onClick={()=>{if(selId)moveInSiblings(selId,-1);setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Move Up</button><button onClick={()=>{if(selId)moveInSiblings(selId,1);setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Move Down</button><button onClick={()=>{doLock();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">{sel?.locked?'Unlock':'Lock'}</button><button onClick={()=>{doHide();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">{sel?.hidden?'Show':'Hide'}</button><button onClick={()=>{doAddChild();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Add Child</button><div className="border-t border-gray-100 mt-1 pt-1"><button onClick={()=>{doDelete();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50">Delete</button></div></div>}
    </div>
  );
}
