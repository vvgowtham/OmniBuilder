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
  const [dragNodes, setDragNodes] = useState<BNode[]|null>(null);
  const [dropTarget, setDropTarget] = useState<{id:string;pos:'before'|'after'|'inside'}|null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string|null>(null);

  useEffect(() => { const t = setTimeout(() => { localStorage.setItem('builder-nodes', JSON.stringify(nodes)); setSaved(true); }, 600); return () => clearTimeout(t); }, [nodes]);

  const push = (n: BNode[]) => { const h = hist.slice(0,hIdx+1); h.push(JSON.parse(JSON.stringify(n))); setHist(h); setHIdx(h.length-1); };
  const up = (n: BNode[]) => { setNodes(n); push(n); setSaved(false); };
  const undo = () => { if(hIdx>0){setHIdx(hIdx-1);setNodes(hist[hIdx-1]);} };
  const redo = () => { if(hIdx<hist.length-1){setHIdx(hIdx+1);setNodes(hist[hIdx+1]);} };

  const find = (ns: BNode[], id: string): BNode|null => { for(const n of ns){if(n.id===id)return n;const f=find(n.children,id);if(f)return f;} return null; };
  const findParent = (ns: BNode[], id: string, parent: BNode|null = null): BNode|null => { for(const n of ns){if(n.id===id)return parent;const f=findParent(n.children,id,n);if(f!==undefined&&f!==null)return f;} return null; };
  const upd = (ns: BNode[], id: string, fn:(n:BNode)=>BNode): BNode[] => ns.map(n=>n.id===id?fn(n):{...n,children:upd(n.children,id,fn)});
  const del = (ns: BNode[], id: string): BNode[] => ns.filter(n=>n.id!==id).map(n=>({...n,children:del(n.children,id)}));
  const insertBefore = (ns: BNode[], targetId: string, newNodes: BNode[]): BNode[] => {
    const result: BNode[] = [];
    for (const n of ns) {
      if (n.id === targetId) { result.push(...newNodes); }
      result.push({...n, children: insertBefore(n.children, targetId, newNodes)});
    }
    return result;
  };
  const insertAfter = (ns: BNode[], targetId: string, newNodes: BNode[]): BNode[] => {
    const result: BNode[] = [];
    for (const n of ns) {
      result.push({...n, children: insertAfter(n.children, targetId, newNodes)});
      if (n.id === targetId) { result.push(...newNodes); }
    }
    return result;
  };
  const insertInside = (ns: BNode[], parentId: string, newNodes: BNode[]): BNode[] => {
    return ns.map(n => n.id === parentId ? {...n, children: [...n.children, ...newNodes]} : {...n, children: insertInside(n.children, parentId, newNodes)});
  };

  const sel = selId ? find(nodes, selId) : null;

  const addAt = (cn: BNode[], target?: {id:string;pos:'before'|'after'|'inside'}) => {
    const cloned = cn.map(cloneNode);
    if (target) {
      if (target.pos === 'before') up(insertBefore(nodes, target.id, cloned));
      else if (target.pos === 'after') up(insertAfter(nodes, target.id, cloned));
      else up(insertInside(nodes, target.id, cloned));
    } else {
      up([...nodes, ...cloned]);
    }
  };

  const applyTpl = (name: string) => {
    const names = TEMPLATES[name]; if(!names) return;
    const all: BNode[] = [];
    for(const n of names){ for(const cat of Object.values(CATEGORIES)){ const c=cat.find(x=>x.name===n); if(c){all.push(...c.nodes.map(cloneNode));break;} } }
    up(all);
  };

  // Move within siblings
  const moveInSiblings = (id: string, dir: -1|1) => {
    const parent = findParent(nodes, id, null);
    if (parent) {
      const siblings = [...parent.children];
      const i = siblings.findIndex(n => n.id === id);
      const newI = i + dir;
      if (newI < 0 || newI >= siblings.length) return;
      [siblings[i], siblings[newI]] = [siblings[newI], siblings[i]];
      up(upd(nodes, parent.id, n => ({...n, children: siblings})));
    } else {
      // Root level
      const i = nodes.findIndex(n => n.id === id);
      const newI = i + dir;
      if (newI < 0 || newI >= nodes.length) return;
      const a = [...nodes];
      [a[i], a[newI]] = [a[newI], a[i]];
      up(a);
    }
  };

  const doDelete = () => { if(!selId)return; up(del(nodes,selId)); setSelId(null); };
  const doDuplicate = () => { if(!selId)return; const n=find(nodes,selId); if(!n)return; const c=cloneNode(n); up(insertAfter(nodes,selId,[c])); setSelId(c.id); };
  const doLock = () => { if(!selId)return; up(upd(nodes,selId,n=>({...n,locked:!n.locked}))); };
  const doHide = () => { if(!selId)return; up(upd(nodes,selId,n=>({...n,hidden:!n.hidden}))); };
  const doUnhide = (id: string) => { up(upd(nodes,id,n=>({...n,hidden:false}))); };
  const doWrap = () => { if(!selId)return; const n=find(nodes,selId); if(!n)return; const w:BNode={id:uid(),type:'container',tag:'div',content:'',name:'Container',styles:{padding:'16px'},children:[{...n}]}; const newNodes = del(nodes,selId); up([...newNodes,w]); setSelId(w.id); };
  const doAddChild = (parentId?: string) => { const pid = parentId || selId; if(!pid)return; const child:BNode={id:uid(),type:'container',tag:'div',content:'',name:'Block',styles:{padding:'12px',background:'#f9fafb',borderRadius:'6px',minHeight:'40px'},children:[]}; up(upd(nodes,pid,n=>({...n,children:[...n.children,child]}))); };

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
      if(e.key==='Escape'){setSelId(null);setCtx(null);setShowAddMenu(null);}
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  });

  // Drop handler
  const handleDrop = (e: React.DragEvent, targetId?: string, pos?: 'before'|'after'|'inside') => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null);
    if (dragNodes) {
      if (targetId && pos) { addAt(dragNodes, {id: targetId, pos}); }
      else { addAt(dragNodes); }
      setDragNodes(null);
    }
  };

  const handleDragOverNode = (e: React.DragEvent, nodeId: string, section: 'top'|'bottom'|'center') => {
    e.preventDefault(); e.stopPropagation();
    const pos = section === 'top' ? 'before' : section === 'bottom' ? 'after' : 'inside';
    setDropTarget({id: nodeId, pos});
  };

  // Render node on canvas
  const renderNode = (node: BNode): React.ReactNode => {
    if(node.hidden) return (
      <div key={node.id} className="relative group" style={{opacity:0.35,padding:'6px 10px',border:'1px dashed #d1d5db',borderRadius:'6px',margin:'4px',fontSize:'10px',color:'#9ca3af',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span>Hidden: {node.name||node.type}</span>
        <button onClick={(e)=>{e.stopPropagation();doUnhide(node.id);}} style={{background:'#7c3aed',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',fontSize:'9px',cursor:'pointer'}}>Show</button>
      </div>
    );
    const isSel = selId===node.id;
    const isDropBefore = dropTarget?.id===node.id && dropTarget?.pos==='before';
    const isDropAfter = dropTarget?.id===node.id && dropTarget?.pos==='after';
    const isDropInside = dropTarget?.id===node.id && dropTarget?.pos==='inside';
    const style: React.CSSProperties = {...(node.styles as any), cursor:node.locked?'not-allowed':'pointer', outline:isSel?'2px solid #7c3aed':isDropInside?'2px dashed #7c3aed':undefined, outlineOffset:'2px', position:'relative' as const, minHeight:!node.content&&node.children.length===0?'50px':undefined};

    return (
      <div key={node.id}>
        {/* Drop before indicator */}
        {isDropBefore && <div style={{height:'3px',background:'#7c3aed',borderRadius:'2px',margin:'2px 0'}}/>}
        <div
          style={style}
          onClick={e=>{e.stopPropagation();if(!node.locked)setSelId(node.id);}}
          onContextMenu={e=>{e.preventDefault();e.stopPropagation();setSelId(node.id);setCtx({x:e.clientX,y:e.clientY,id:node.id});}}
          draggable={!node.locked}
          onDragStart={e=>{e.stopPropagation();setDragNodes([node]);setSelId(node.id);}}
          onDragEnd={()=>setDragNodes(null)}
          onDragOver={e=>{
            e.preventDefault();e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const h = rect.height;
            if (y < h * 0.25) handleDragOverNode(e, node.id, 'top');
            else if (y > h * 0.75) handleDragOverNode(e, node.id, 'bottom');
            else handleDragOverNode(e, node.id, 'center');
          }}
          onDrop={e=>handleDrop(e, node.id, dropTarget?.id===node.id?dropTarget.pos:'inside')}
          onDragLeave={()=>setDropTarget(null)}
        >
          {/* Floating toolbar */}
          {isSel&&<div style={{position:'absolute',top:'-34px',left:'0',display:'flex',gap:'2px',zIndex:50,background:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',padding:'3px',boxShadow:'0 4px 12px rgba(0,0,0,0.12)'}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>moveInSiblings(node.id,-1)} title="Move Up" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#eef2ff',color:'#4f46e5',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>&#8593;</button>
            <button onClick={()=>moveInSiblings(node.id,1)} title="Move Down" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#eef2ff',color:'#4f46e5',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>&#8595;</button>
            <button onClick={doDuplicate} title="Duplicate" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#f0fdf4',color:'#16a34a',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>&#9776;</button>
            <button onClick={doLock} title={node.locked?'Unlock':'Lock'} style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:node.locked?'#fef3c7':'#f5f5f5',color:node.locked?'#d97706':'#6b7280',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>&#128274;</button>
            <button onClick={doHide} title="Hide" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#f5f5f5',color:'#6b7280',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>&#128065;</button>
            <button onClick={doWrap} title="Wrap" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#ede9fe',color:'#7c3aed',cursor:'pointer',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center'}}>[ ]</button>
            <button onClick={()=>doAddChild(node.id)} title="Add Child" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#ecfdf5',color:'#059669',cursor:'pointer',fontSize:'15px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>+</button>
            <button onClick={doDelete} title="Delete" style={{width:'26px',height:'26px',borderRadius:'6px',border:'none',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center'}}>&#10005;</button>
          </div>}

          {node.content&&<span contentEditable={!node.locked} suppressContentEditableWarning onBlur={e=>{if(!node.locked){const c=e.currentTarget.textContent||'';setNodes(p=>upd(p,node.id,n=>({...n,content:c})));setSaved(false);}}}>{node.content}</span>}
          {node.children.map(renderNode)}

          {/* Add element button for containers */}
          {node.children.length===0&&!node.content&&node.type==='container'&&(
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',minHeight:'40px'}}>
              <button onClick={e=>{e.stopPropagation();setShowAddMenu(showAddMenu===node.id?null:node.id);}} style={{width:'32px',height:'32px',borderRadius:'50%',border:'2px dashed #d1d5db',background:'#fff',color:'#7c3aed',cursor:'pointer',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}} onMouseEnter={e=>(e.currentTarget.style.borderColor='#7c3aed')} onMouseLeave={e=>(e.currentTarget.style.borderColor='#d1d5db')}>+</button>
            </div>
          )}

          {/* Add menu popup */}
          {showAddMenu===node.id&&(
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:60,background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'8px',boxShadow:'0 8px 24px rgba(0,0,0,0.15)',width:'200px',maxHeight:'300px',overflow:'auto'}} onClick={e=>e.stopPropagation()}>
              <p style={{fontSize:'10px',fontWeight:'700',color:'#6b7280',marginBottom:'6px',padding:'0 4px'}}>Add Element</p>
              {Object.entries(CATEGORIES).slice(0,6).map(([cat,comps])=>(
                <div key={cat}>
                  <p style={{fontSize:'9px',fontWeight:'700',color:'#9ca3af',padding:'4px',marginTop:'4px'}}>{cat}</p>
                  {comps.slice(0,4).map(c=>(
                    <button key={c.name} onClick={()=>{addAt(c.nodes,{id:node.id,pos:'inside'});setShowAddMenu(null);}} style={{width:'100%',textAlign:'left',padding:'4px 8px',border:'none',background:'transparent',fontSize:'10px',borderRadius:'4px',cursor:'pointer',color:'#374151'}} onMouseEnter={e=>(e.currentTarget.style.background='#f3f0ff')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{c.name}</button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Drop after indicator */}
        {isDropAfter && <div style={{height:'3px',background:'#7c3aed',borderRadius:'2px',margin:'2px 0'}}/>}
      </div>
    );
  };

  // Layers with full actions
  const renderLayer = (node: BNode, depth: number): React.ReactNode => (
    <div key={node.id} style={{marginLeft:depth*12+'px'}}>
      <div className={`flex items-center gap-1 py-[3px] px-1 rounded group ${selId===node.id?'bg-purple-100 text-purple-700':'text-gray-600 hover:bg-gray-50'} ${node.hidden?'opacity-40':''}`}>
        <button onClick={()=>setSelId(node.id)} className="flex-1 text-left truncate text-[10px] cursor-pointer">
          {node.children.length>0?'v ':'. '}{node.name||node.type}{node.content?': '+node.content.slice(0,10):''}
        </button>
        <div className="hidden group-hover:flex items-center gap-[2px]">
          <button onClick={()=>{setSelId(node.id);moveInSiblings(node.id,-1);}} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[9px]" style={{background:'#eef2ff',color:'#4f46e5'}} title="Up">&#8593;</button>
          <button onClick={()=>{setSelId(node.id);moveInSiblings(node.id,1);}} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[9px]" style={{background:'#eef2ff',color:'#4f46e5'}} title="Down">&#8595;</button>
          <button onClick={()=>{setSelId(node.id);doDuplicate();}} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[9px]" style={{background:'#f0fdf4',color:'#16a34a'}} title="Duplicate">D</button>
          <button onClick={()=>doAddChild(node.id)} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[10px]" style={{background:'#ecfdf5',color:'#059669'}} title="Add">+</button>
          <button onClick={()=>{setSelId(node.id);doLock();}} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[8px]" style={{background:node.locked?'#fef3c7':'#f5f5f5',color:node.locked?'#d97706':'#9ca3af'}} title="Lock">L</button>
          <button onClick={()=>{if(node.hidden){doUnhide(node.id);}else{setSelId(node.id);doHide();}}} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[8px]" style={{background:node.hidden?'#dbeafe':'#f5f5f5',color:node.hidden?'#2563eb':'#9ca3af'}} title={node.hidden?'Show':'Hide'}>{node.hidden?'S':'H'}</button>
          <button onClick={()=>{setSelId(node.id);doDelete();}} className="w-[18px] h-[18px] rounded flex items-center justify-center text-[9px]" style={{background:'#fef2f2',color:'#dc2626'}} title="Delete">X</button>
        </div>
      </div>
      {node.children.map(c=>renderLayer(c,depth+1))}
    </div>
  );

  const PROPS: [string,string][] = [['fontSize','Font Size'],['fontWeight','Weight'],['color','Color'],['background','Background'],['padding','Padding'],['margin','Margin'],['borderRadius','Radius'],['border','Border'],['boxShadow','Shadow'],['opacity','Opacity'],['width','Width'],['height','Height'],['maxWidth','Max W'],['minHeight','Min H'],['display','Display'],['flexDirection','Flex Dir'],['alignItems','Align'],['justifyContent','Justify'],['gap','Gap'],['gridTemplateColumns','Grid Cols'],['position','Position'],['top','Top'],['left','Left'],['right','Right'],['bottom','Bottom'],['zIndex','Z-Index'],['overflow','Overflow'],['transform','Transform'],['transition','Transition'],['letterSpacing','Letter Sp'],['lineHeight','Line H'],['textDecoration','Text Deco'],['textTransform','Text Trans'],['aspectRatio','Aspect'],['objectFit','Object Fit'],['filter','Filter'],['backdropFilter','Backdrop']];

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-sm" onClick={()=>{setCtx(null);setShowAddMenu(null);}}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 h-10 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-purple-600 font-medium text-xs">Back</Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">Visual Builder</span>
        </div>
        <div className="flex items-center gap-1">
          {(['desktop','tablet','mobile'] as const).map(b=>(<button key={b} onClick={()=>setBp(b)} className={`px-2 h-7 rounded text-[10px] font-semibold ${bp===b?'bg-purple-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{b[0].toUpperCase()}</button>))}
          <span className="w-px h-4 bg-gray-200 mx-1"/>
          <button onClick={undo} className="px-2 h-7 rounded bg-gray-100 text-[10px] font-semibold hover:bg-gray-200" title="Ctrl+Z">Undo</button>
          <button onClick={redo} className="px-2 h-7 rounded bg-gray-100 text-[10px] font-semibold hover:bg-gray-200" title="Ctrl+Shift+Z">Redo</button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${saved?'text-green-600':'text-orange-500'}`}>{saved?'Saved':'Unsaved'}</span>
          <button className="h-7 px-3 rounded bg-gray-100 text-[10px] font-semibold hover:bg-gray-200">Preview</button>
          <button className="h-7 px-3 rounded bg-purple-600 text-white text-[10px] font-semibold hover:bg-purple-700">Publish</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[240px_1fr_260px] overflow-hidden">
        {/* LEFT */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['components','elements','templates','pages'] as const).map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex-1 py-1.5 text-[10px] font-semibold capitalize ${tab===t?'text-purple-700 border-b-2 border-purple-600':'text-gray-500 hover:text-gray-700'}`}>{t}</button>))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {tab==='components'&&<div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search components..." className="w-full h-7 rounded-lg border border-gray-200 px-2 text-[10px] mb-2 focus:border-purple-500 focus:outline-none"/>
              {Object.entries(CATEGORIES).filter(([c])=>!search||c.toLowerCase().includes(search.toLowerCase())).map(([cat,comps])=>(<div key={cat} className="mb-0.5">
                <button onClick={()=>setExpCat(expCat===cat?null:cat)} className="w-full flex justify-between items-center px-2 py-1.5 rounded-lg text-[11px] font-semibold text-gray-700 hover:bg-gray-50">{cat}<span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{comps.length}</span></button>
                {expCat===cat&&<div className="pl-1 space-y-0.5 mt-0.5">{comps.map(c=>(<div key={c.name} draggable onDragStart={()=>setDragNodes(c.nodes)} onDragEnd={()=>setDragNodes(null)} onClick={()=>addAt(c.nodes)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] text-gray-600 hover:bg-purple-50 hover:text-purple-700 cursor-grab active:cursor-grabbing border border-transparent hover:border-purple-200 transition-all"><span className="w-4 h-4 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-[8px] font-bold shrink-0">{c.name[0]}</span>{c.name}</div>))}</div>}
              </div>))}
            </div>}
            {tab==='elements'&&<div className="space-y-0.5">{Object.entries(CATEGORIES).flatMap(([,comps])=>comps).slice(0,30).map(el=>(<div key={el.name} draggable onDragStart={()=>setDragNodes(el.nodes)} onDragEnd={()=>setDragNodes(null)} onClick={()=>addAt(el.nodes)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-grab border border-transparent hover:border-purple-200"><span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[8px]">+</span>{el.name}</div>))}</div>}
            {tab==='templates'&&<div className="space-y-1.5"><p className="text-[9px] text-gray-400 px-1 mb-1">Click to apply a full page template</p>{Object.keys(TEMPLATES).map(n=>(<button key={n} onClick={()=>{if(nodes.length>0&&!confirm('Replace current page?'))return;applyTpl(n);}} className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"><div className="text-[11px] font-semibold text-gray-800">{n}</div><div className="text-[9px] text-gray-400 mt-0.5">{TEMPLATES[n].length} sections</div></button>))}</div>}
            {tab==='pages'&&<div className="p-2"><p className="text-[10px] text-gray-500 mb-3">Manage pages for this project</p><Link href="/pages" className="block text-[10px] text-purple-600 font-semibold bg-purple-50 px-3 py-2 rounded-lg hover:bg-purple-100">Open Pages Manager</Link></div>}
          </div>
        </div>

        {/* CANVAS */}
        <div className="overflow-y-auto p-4 flex flex-col items-center" onClick={()=>{setSelId(null);setShowAddMenu(null);}} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e)}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all ${bp==='desktop'?'w-full max-w-[1200px]':bp==='tablet'?'w-[768px]':'w-[375px]'}`} style={{minHeight:'100%'}}>
            {nodes.length>0?nodes.map(renderNode):(<div className="flex flex-col items-center justify-center h-80 text-gray-400"><p className="text-lg font-semibold mb-1">Empty Canvas</p><p className="text-xs">Drag components here or apply a template from the left panel</p></div>)}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Properties</h4>
            {sel?(<div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <input value={sel.name||sel.type} onChange={e=>rename(e.target.value)} className="flex-1 text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-purple-300"/>
                <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{sel.tag}</span>
              </div>
              {sel.content!==undefined&&<div><label className="block text-[8px] font-semibold text-gray-500 uppercase">Content</label><textarea value={sel.content} onChange={e=>cont(e.target.value)} className="w-full h-12 rounded-md border border-gray-200 p-1.5 text-[10px] resize-none focus:border-purple-500 focus:outline-none"/></div>}
              {PROPS.map(([k,l])=>(<div key={k}><label className="block text-[8px] font-semibold text-gray-500 uppercase">{l}</label><input value={(sel.styles as any)[k]||''} onChange={e=>styl(k,e.target.value)} className="w-full h-[22px] rounded-md border border-gray-200 px-1.5 text-[10px] focus:border-purple-500 focus:outline-none" placeholder={k}/></div>))}
              <div><label className="block text-[8px] font-semibold text-gray-500 uppercase">Align</label><div className="flex gap-0.5">{['left','center','right'].map(a=>(<button key={a} onClick={()=>styl('textAlign',a)} className={`flex-1 h-[22px] rounded-md border text-[9px] font-bold ${sel.styles.textAlign===a?'border-purple-500 bg-purple-50 text-purple-600':'border-gray-200 hover:bg-gray-50'}`}>{a[0].toUpperCase()}</button>))}</div></div>
              <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-1">
                <button onClick={doDuplicate} className="h-[22px] rounded-md text-[8px] font-semibold" style={{background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0'}}>Duplicate</button>
                <button onClick={doLock} className="h-[22px] rounded-md text-[8px] font-semibold" style={{background:sel.locked?'#fef3c7':'#f5f5f5',color:sel.locked?'#d97706':'#6b7280',border:'1px solid #e5e7eb'}}>{sel.locked?'Unlock':'Lock'}</button>
                <button onClick={doHide} className="h-[22px] rounded-md text-[8px] font-semibold" style={{background:'#f5f5f5',color:'#6b7280',border:'1px solid #e5e7eb'}}>{sel.hidden?'Show':'Hide'}</button>
                <button onClick={doWrap} className="h-[22px] rounded-md text-[8px] font-semibold" style={{background:'#ede9fe',color:'#7c3aed',border:'1px solid #ddd6fe'}}>Wrap</button>
                <button onClick={()=>doAddChild()} className="h-[22px] rounded-md text-[8px] font-semibold" style={{background:'#ecfdf5',color:'#059669',border:'1px solid #a7f3d0'}}>+Child</button>
                <button onClick={doDelete} className="h-[22px] rounded-md text-[8px] font-semibold" style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca'}}>Delete</button>
              </div>
            </div>):(<p className="text-[10px] text-gray-400 mt-2">Select an element on the canvas to edit its properties</p>)}
          </div>
          {/* Layers */}
          <div className="border-t border-gray-200 h-[220px] overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Layers</h4>
            {nodes.length===0?<p className="text-[9px] text-gray-400">Empty</p>:nodes.map(n=>renderLayer(n,0))}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {ctx&&<div style={{position:'fixed',top:ctx.y,left:ctx.x,zIndex:9999}} className="bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[160px]" onClick={e=>e.stopPropagation()}>
        <button onClick={()=>{doDuplicate();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-purple-50 flex items-center gap-2"><span style={{color:'#16a34a'}}>D</span> Duplicate</button>
        <button onClick={()=>{if(selId)moveInSiblings(selId,-1);setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2"><span style={{color:'#4f46e5'}}>^</span> Move Up</button>
        <button onClick={()=>{if(selId)moveInSiblings(selId,1);setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2"><span style={{color:'#4f46e5'}}>v</span> Move Down</button>
        <button onClick={()=>{doLock();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2"><span style={{color:'#d97706'}}>L</span> {sel?.locked?'Unlock':'Lock'}</button>
        <button onClick={()=>{doHide();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2"><span style={{color:'#6b7280'}}>H</span> {sel?.hidden?'Show':'Hide'}</button>
        <button onClick={()=>{doWrap();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2"><span style={{color:'#7c3aed'}}>W</span> Wrap</button>
        <button onClick={()=>{doAddChild();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 flex items-center gap-2"><span style={{color:'#059669'}}>+</span> Add Child</button>
        <button onClick={()=>{if(selId)localStorage.setItem('cb',JSON.stringify(find(nodes,selId)));setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Copy</button>
        <button onClick={()=>{const c=localStorage.getItem('cb');if(c)try{up([...nodes,cloneNode(JSON.parse(c))])}catch{};setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Paste</button>
        <div className="border-t border-gray-100 mt-1 pt-1">
          <button onClick={()=>{doDelete();setCtx(null);}} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2"><span>X</span> Delete</button>
        </div>
      </div>}
    </div>
  );
}
