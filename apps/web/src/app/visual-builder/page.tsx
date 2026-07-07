'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, TEMPLATES, BNode, uid, cloneNode } from './components';

export default function VisualBuilderPage() {
  const [nodes, setNodes] = useState<BNode[]>(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('builder-nodes');
      if (s) try { return JSON.parse(s); } catch {}
    }
    return [];
  });
  const [selId, setSelId] = useState<string|null>(null);
  const [bp, setBp] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [tab, setTab] = useState<'components'|'elements'|'templates'|'pages'>('components');
  const [hist, setHist] = useState<BNode[][]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState('');
  const [expCat, setExpCat] = useState<string|null>('Hero');
  const [ctx, setCtx] = useState<{x:number;y:number;id:string}|null>(null);
  const [dragComp, setDragComp] = useState<BNode[]|null>(null);
  const [dropIdx, setDropIdx] = useState<number|null>(null);

  useEffect(() => { const t = setTimeout(() => { localStorage.setItem('builder-nodes', JSON.stringify(nodes)); setSaved(true); }, 600); return () => clearTimeout(t); }, [nodes]);

  const push = (n: BNode[]) => { const h = hist.slice(0,hIdx+1); h.push(JSON.parse(JSON.stringify(n))); setHist(h); setHIdx(h.length-1); };
  const up = (n: BNode[]) => { setNodes(n); push(n); setSaved(false); };
  const undo = () => { if(hIdx>0){setHIdx(hIdx-1);setNodes(hist[hIdx-1]);} };
  const redo = () => { if(hIdx<hist.length-1){setHIdx(hIdx+1);setNodes(hist[hIdx+1]);} };

  const find = (ns: BNode[], id: string): BNode|null => { for(const n of ns){if(n.id===id)return n;const f=find(n.children,id);if(f)return f;} return null; };
  const upd = (ns: BNode[], id: string, fn:(n:BNode)=>BNode): BNode[] => ns.map(n=>n.id===id?fn(n):{...n,children:upd(n.children,id,fn)});
  const del = (ns: BNode[], id: string): BNode[] => ns.filter(n=>n.id!==id).map(n=>({...n,children:del(n.children,id)}));

  const sel = selId ? find(nodes, selId) : null;

  const addComp = (cn: BNode[], atIdx?: number) => {
    const cloned = cn.map(cloneNode);
    if (atIdx !== undefined && atIdx >= 0) {
      const n = [...nodes]; n.splice(atIdx, 0, ...cloned); up(n);
    } else { up([...nodes, ...cloned]); }
  };

  const applyTpl = (name: string) => {
    const names = TEMPLATES[name]; if(!names) return;
    const all: BNode[] = [];
    for(const n of names){ for(const cat of Object.values(CATEGORIES)){ const c=cat.find(x=>x.name===n); if(c){all.push(...c.nodes.map(cloneNode));break;} } }
    up(all);
  };

  const moveUp = (id:string) => { const i=nodes.findIndex(n=>n.id===id); if(i>0){const a=[...nodes];[a[i-1],a[i]]=[a[i],a[i-1]];up(a);} };
  const moveDown = (id:string) => { const i=nodes.findIndex(n=>n.id===id); if(i>=0&&i<nodes.length-1){const a=[...nodes];[a[i],a[i+1]]=[a[i+1],a[i]];up(a);} };
  const doDelete = () => { if(!selId)return; up(del(nodes,selId)); setSelId(null); };
  const doDuplicate = () => { if(!selId)return; const n=find(nodes,selId); if(n)up([...nodes,cloneNode(n)]); };
  const doLock = () => { if(!selId)return; up(upd(nodes,selId,n=>({...n,locked:!n.locked}))); };
  const doHide = () => { if(!selId)return; up(upd(nodes,selId,n=>({...n,hidden:!n.hidden}))); };
  const doWrap = () => { if(!selId)return; const n=find(nodes,selId); if(!n)return; const w:BNode={id:uid(),type:'container',tag:'div',content:'',name:'Wrapper',styles:{padding:'16px',border:'1px dashed #d1d5db',borderRadius:'8px'},children:[{...n}]}; up(del(nodes,selId).concat([w])); setSelId(w.id); };
  const doAddChild = () => { if(!selId)return; const child:BNode={id:uid(),type:'container',tag:'div',content:'',name:'Child',styles:{padding:'12px',background:'#f9fafb',borderRadius:'6px',minHeight:'40px'},children:[]}; up(upd(nodes,selId,n=>({...n,children:[...n.children,child]}))); };

  const styl = (p:string,v:string) => { if(!selId)return; up(upd(nodes,selId,n=>({...n,styles:{...n.styles,[p]:v}}))); };
  const cont = (v:string) => { if(!selId)return; up(upd(nodes,selId,n=>({...n,content:v}))); };
  const rename = (v:string) => { if(!selId)return; up(upd(nodes,selId,n=>({...n,name:v}))); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
      if((e.target as HTMLElement).isContentEditable)return;
      if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo();}
      if((e.metaKey||e.ctrlKey)&&e.key==='d'){e.preventDefault();doDuplicate();}
      if((e.metaKey||e.ctrlKey)&&e.key==='c'&&selId){localStorage.setItem('cb',JSON.stringify(find(nodes,selId)));}
      if((e.metaKey||e.ctrlKey)&&e.key==='v'){const c=localStorage.getItem('cb');if(c)try{up([...nodes,cloneNode(JSON.parse(c))])}catch{}}
      if(e.key==='Delete'||e.key==='Backspace'){if(selId)doDelete();}
      if(e.key==='Escape'){setSelId(null);setCtx(null);}
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  });

  // Drop handler for canvas
  const handleCanvasDrop = (e: React.DragEvent, idx?: number) => {
    e.preventDefault(); e.stopPropagation(); setDropIdx(null);
    if (dragComp) { addComp(dragComp, idx); setDragComp(null); }
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDropIdx(idx); };

  const renderNode = (node: BNode, idx: number): React.ReactNode => {
    if(node.hidden) return <div key={node.id} style={{opacity:0.3,padding:'4px 8px',border:'1px dashed #d1d5db',borderRadius:'4px',fontSize:'10px',color:'#9ca3af',margin:'4px 0'}}>Hidden: {node.name||node.type}</div>;
    const isSel = selId===node.id;
    const style: React.CSSProperties = {...(node.styles as any), cursor:node.locked?'not-allowed':'pointer', outline:isSel?'2px solid #7c3aed':undefined, outlineOffset:'2px', position:'relative' as const, minHeight:!node.content&&node.children.length===0?'40px':undefined};
    return (
      <div key={node.id}>
        {/* Drop indicator */}
        <div onDragOver={e=>handleDragOver(e,idx)} onDrop={e=>handleCanvasDrop(e,idx)} style={{height:dropIdx===idx?'4px':'0',background:dropIdx===idx?'#7c3aed':'transparent',borderRadius:'2px',transition:'height 0.15s',margin:dropIdx===idx?'4px 0':'0'}}/>
        <div style={style} onClick={e=>{e.stopPropagation();if(!node.locked)setSelId(node.id);}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setSelId(node.id);setCtx({x:e.clientX,y:e.clientY,id:node.id});}} draggable={!node.locked} onDragStart={()=>{setDragComp([node]);setSelId(node.id);}}>
          {/* Floating toolbar */}
          {isSel&&<div style={{position:'absolute',top:'-36px',left:'0',display:'flex',gap:'1px',zIndex:50,background:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',padding:'3px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} onClick={e=>e.stopPropagation()}>
            <button onClick={doDuplicate} title="Duplicate" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#f9fafb',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>D</button>
            <button onClick={doDelete} title="Delete" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>X</button>
            <button onClick={()=>moveUp(node.id)} title="Move Up" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#f9fafb',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>^</button>
            <button onClick={()=>moveDown(node.id)} title="Move Down" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#f9fafb',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>v</button>
            <button onClick={doLock} title={node.locked?'Unlock':'Lock'} style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:node.locked?'#fef3c7':'#f9fafb',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>L</button>
            <button onClick={doHide} title="Hide" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#f9fafb',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>H</button>
            <button onClick={doWrap} title="Wrap" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#f9fafb',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>W</button>
            <button onClick={doAddChild} title="Add Child" style={{width:'28px',height:'28px',borderRadius:'6px',border:'none',background:'#f0fdf4',color:'#16a34a',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
          </div>}
          {node.content&&<span contentEditable={!node.locked} suppressContentEditableWarning onBlur={e=>{if(!node.locked){const c=e.currentTarget.textContent||'';setNodes(p=>upd(p,node.id,n=>({...n,content:c})));setSaved(false);}}}>{node.content}</span>}
          {node.children.map((c,i)=>renderNode(c,i))}
        </div>
      </div>
    );
  };

  // Layers panel with full actions
  const renderLayer = (node: BNode, depth: number): React.ReactNode => (
    <div key={node.id} style={{marginLeft:depth*10+'px'}}>
      <div className={`flex items-center gap-1 py-0.5 px-1 rounded group ${selId===node.id?'bg-purple-100 text-purple-700':'text-gray-600 hover:bg-gray-50'} ${node.hidden?'opacity-40':''}`}>
        <button onClick={()=>setSelId(node.id)} className="flex-1 text-left truncate text-[10px] cursor-pointer">
          {node.children.length>0?'v ':'. '}{node.name||node.type}{node.content?': '+node.content.slice(0,10):''}
        </button>
        {/* Layer action icons */}
        <div className="hidden group-hover:flex gap-0.5">
          <button onClick={()=>{setSelId(node.id);doAddChild();}} className="w-4 h-4 rounded bg-green-50 text-green-600 text-[8px] flex items-center justify-center" title="Add Child">+</button>
          <button onClick={()=>{setSelId(node.id);doDuplicate();}} className="w-4 h-4 rounded bg-gray-100 text-[8px] flex items-center justify-center" title="Duplicate">D</button>
          <button onClick={()=>{setSelId(node.id);doDelete();}} className="w-4 h-4 rounded bg-red-50 text-red-600 text-[8px] flex items-center justify-center" title="Delete">X</button>
          <button onClick={()=>moveUp(node.id)} className="w-4 h-4 rounded bg-gray-100 text-[8px] flex items-center justify-center" title="Up">^</button>
          <button onClick={()=>moveDown(node.id)} className="w-4 h-4 rounded bg-gray-100 text-[8px] flex items-center justify-center" title="Down">v</button>
          <button onClick={()=>{setSelId(node.id);doLock();}} className="w-4 h-4 rounded bg-gray-100 text-[8px] flex items-center justify-center" title="Lock">L</button>
          <button onClick={()=>{setSelId(node.id);doHide();}} className="w-4 h-4 rounded bg-gray-100 text-[8px] flex items-center justify-center" title="Hide">H</button>
        </div>
      </div>
      {node.children.map(c=>renderLayer(c,depth+1))}
    </div>
  );

  const PROPS: [string,string][] = [['fontSize','Font Size'],['fontWeight','Weight'],['color','Color'],['background','Background'],['padding','Padding'],['margin','Margin'],['borderRadius','Radius'],['border','Border'],['boxShadow','Shadow'],['opacity','Opacity'],['width','Width'],['height','Height'],['maxWidth','Max Width'],['minHeight','Min Height'],['display','Display'],['flexDirection','Flex Dir'],['alignItems','Align'],['justifyContent','Justify'],['gap','Gap'],['gridTemplateColumns','Grid Cols'],['position','Position'],['top','Top'],['left','Left'],['zIndex','Z-Index'],['overflow','Overflow'],['transform','Transform'],['transition','Transition'],['letterSpacing','Spacing'],['lineHeight','Line H'],['textDecoration','Decoration']];

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-sm" onClick={()=>setCtx(null)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 h-10 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-purple-600 font-medium text-xs">Back</Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">Visual Builder</span>
        </div>
        <div className="flex items-center gap-1">
          {(['desktop','tablet','mobile'] as const).map(b=>(<button key={b} onClick={()=>setBp(b)} className={`px-2 h-7 rounded text-[10px] font-semibold ${bp===b?'bg-purple-600 text-white':'bg-gray-100 text-gray-600'}`}>{b[0].toUpperCase()}</button>))}
          <span className="w-px h-4 bg-gray-200 mx-1"/>
          <button onClick={undo} className="px-2 h-7 rounded bg-gray-100 text-[10px] font-semibold hover:bg-gray-200" title="Undo">Undo</button>
          <button onClick={redo} className="px-2 h-7 rounded bg-gray-100 text-[10px] font-semibold hover:bg-gray-200" title="Redo">Redo</button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${saved?'text-green-600':'text-orange-500'}`}>{saved?'Saved':'Unsaved'}</span>
          <button className="h-7 px-3 rounded bg-gray-100 text-[10px] font-semibold">Preview</button>
          <button className="h-7 px-3 rounded bg-purple-600 text-white text-[10px] font-semibold">Publish</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[240px_1fr_260px] overflow-hidden">
        {/* LEFT */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['components','elements','templates','pages'] as const).map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex-1 py-1.5 text-[10px] font-semibold capitalize ${tab===t?'text-purple-700 border-b-2 border-purple-600':'text-gray-500'}`}>{t}</button>))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {tab==='components'&&<div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full h-6 rounded border border-gray-200 px-2 text-[10px] mb-2 focus:border-purple-500 focus:outline-none"/>
              {Object.entries(CATEGORIES).filter(([c])=>!search||c.toLowerCase().includes(search.toLowerCase())).map(([cat,comps])=>(<div key={cat} className="mb-0.5">
                <button onClick={()=>setExpCat(expCat===cat?null:cat)} className="w-full flex justify-between items-center px-2 py-1 rounded text-[10px] font-semibold text-gray-700 hover:bg-gray-50">{cat}<span className="text-gray-400">{comps.length}</span></button>
                {expCat===cat&&<div className="pl-1 space-y-0.5">{comps.map(c=>(<div key={c.name} draggable onDragStart={()=>setDragComp(c.nodes)} onDragEnd={()=>setDragComp(null)} className="w-full text-left px-2 py-1 rounded text-[10px] text-gray-600 hover:bg-purple-50 hover:text-purple-700 cursor-grab active:cursor-grabbing flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 flex items-center justify-center text-[7px]">:</span>{c.name}</div>))}</div>}
              </div>))}
            </div>}
            {tab==='elements'&&<div className="space-y-0.5">{(CATEGORIES['Typography']||[]).concat(CATEGORIES['Buttons']||[]).concat(CATEGORIES['Layout']||[]).concat(CATEGORIES['Utility']||[]).map(el=>(<div key={el.name} draggable onDragStart={()=>setDragComp(el.nodes)} onDragEnd={()=>setDragComp(null)} className="w-full text-left flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-grab"><span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[8px]">+</span>{el.name}</div>))}</div>}
            {tab==='templates'&&<div className="space-y-1"><p className="text-[9px] text-gray-400 px-1">Click to apply full page template</p>{Object.keys(TEMPLATES).map(n=>(<button key={n} onClick={()=>{if(nodes.length>0&&!confirm('Replace content?'))return;applyTpl(n);}} className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50"><div className="text-[10px] font-semibold text-gray-800">{n}</div><div className="text-[9px] text-gray-400">{TEMPLATES[n].length} sections</div></button>))}</div>}
            {tab==='pages'&&<div className="p-2 space-y-2"><p className="text-[10px] text-gray-500">Switch between pages or create new ones from the Pages module.</p><Link href="/pages" className="block text-[10px] text-purple-600 font-semibold">Open Pages Manager</Link></div>}
          </div>
        </div>

        {/* CANVAS */}
        <div className="overflow-y-auto p-4 flex flex-col items-center" onClick={()=>setSelId(null)} onDragOver={e=>e.preventDefault()} onDrop={e=>handleCanvasDrop(e)}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all ${bp==='desktop'?'w-full max-w-[1200px]':bp==='tablet'?'w-[768px]':'w-[375px]'}`} style={{minHeight:'600px'}}>
            {nodes.length>0?nodes.map((n,i)=>renderNode(n,i)):(<div className="flex flex-col items-center justify-center h-80 text-gray-400"><p className="font-medium">Start building</p><p className="text-xs mt-1">Drag components here or apply a template</p></div>)}
            {/* Final drop zone */}
            <div onDragOver={e=>{e.preventDefault();setDropIdx(nodes.length);}} onDrop={e=>handleCanvasDrop(e,nodes.length)} style={{height:dropIdx===nodes.length?'4px':'0',background:dropIdx===nodes.length?'#7c3aed':'transparent',borderRadius:'2px',transition:'height 0.15s'}}/>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Properties</h4>
            {sel?(<div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <input value={sel.name||sel.type} onChange={e=>rename(e.target.value)} className="flex-1 text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border-0 focus:outline-none focus:ring-1 focus:ring-purple-300"/>
                <span className="text-[9px] text-gray-400">{sel.tag}</span>
              </div>
              {sel.content!==undefined&&<div><label className="block text-[8px] font-semibold text-gray-500 uppercase">Content</label><textarea value={sel.content} onChange={e=>cont(e.target.value)} className="w-full h-10 rounded border border-gray-200 p-1 text-[10px] resize-none focus:border-purple-500 focus:outline-none"/></div>}
              {PROPS.map(([k,l])=>(<div key={k}><label className="block text-[8px] font-semibold text-gray-500 uppercase">{l}</label><input value={(sel.styles as any)[k]||''} onChange={e=>styl(k,e.target.value)} className="w-full h-5 rounded border border-gray-200 px-1 text-[10px] focus:border-purple-500 focus:outline-none" placeholder={k}/></div>))}
              <div><label className="block text-[8px] font-semibold text-gray-500 uppercase">Text Align</label><div className="flex gap-0.5">{['left','center','right'].map(a=>(<button key={a} onClick={()=>styl('textAlign',a)} className={`flex-1 h-5 rounded border text-[8px] font-bold ${sel.styles.textAlign===a?'border-purple-500 bg-purple-50 text-purple-600':'border-gray-200'}`}>{a[0].toUpperCase()}</button>))}</div></div>
              <div className="pt-1 border-t border-gray-100 grid grid-cols-3 gap-0.5">
                <button onClick={doDuplicate} className="h-5 rounded border border-gray-200 text-[8px] font-semibold hover:bg-gray-50">Dup</button>
                <button onClick={doDelete} className="h-5 rounded border border-red-200 text-[8px] text-red-600 hover:bg-red-50">Del</button>
                <button onClick={doLock} className="h-5 rounded border border-gray-200 text-[8px] hover:bg-gray-50">{sel.locked?'Unlock':'Lock'}</button>
                <button onClick={doHide} className="h-5 rounded border border-gray-200 text-[8px] hover:bg-gray-50">{sel.hidden?'Show':'Hide'}</button>
                <button onClick={doWrap} className="h-5 rounded border border-gray-200 text-[8px] hover:bg-gray-50">Wrap</button>
                <button onClick={doAddChild} className="h-5 rounded border border-green-200 text-[8px] text-green-600 hover:bg-green-50">+Child</button>
              </div>
            </div>):(<p className="text-[10px] text-gray-400">Select an element to edit</p>)}
          </div>
          {/* Layers */}
          <div className="border-t border-gray-200 h-[220px] overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Layers</h4>
            {nodes.length===0?<p className="text-[9px] text-gray-400">Empty canvas</p>:nodes.map(n=>renderLayer(n,0))}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {ctx&&<div style={{position:'fixed',top:ctx.y,left:ctx.x,zIndex:9999}} className="bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[150px]" onClick={e=>e.stopPropagation()}>
        <button onClick={()=>{doDuplicate();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Duplicate</button>
        <button onClick={()=>{doDelete();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50">Delete</button>
        <button onClick={()=>{if(selId)moveUp(selId);setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Move Up</button>
        <button onClick={()=>{if(selId)moveDown(selId);setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Move Down</button>
        <button onClick={()=>{doLock();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">{sel?.locked?'Unlock':'Lock'}</button>
        <button onClick={()=>{doHide();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">{sel?.hidden?'Show':'Hide'}</button>
        <button onClick={()=>{doWrap();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Wrap</button>
        <button onClick={()=>{doAddChild();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Add Child</button>
        <button onClick={()=>{if(selId)localStorage.setItem('cb',JSON.stringify(find(nodes,selId)));setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Copy</button>
        <button onClick={()=>{const c=localStorage.getItem('cb');if(c)try{up([...nodes,cloneNode(JSON.parse(c))])}catch{};setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Paste</button>
      </div>}
    </div>
  );
}
