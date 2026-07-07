'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

interface BuilderNode {
  id: string;
  type: string;
  tag: string;
  content: string;
  styles: Record<string, string>;
  children: BuilderNode[];
}

const ELEMENTS = [
  { type: 'section', label: 'Section', tag: 'section' },
  { type: 'container', label: 'Container', tag: 'div' },
  { type: 'heading', label: 'Heading', tag: 'h2' },
  { type: 'text', label: 'Text', tag: 'p' },
  { type: 'image', label: 'Image', tag: 'img' },
  { type: 'button', label: 'Button', tag: 'button' },
  { type: 'video', label: 'Video', tag: 'video' },
  { type: 'form', label: 'Form', tag: 'form' },
  { type: 'slider', label: 'Slider', tag: 'div' },
  { type: 'tabs', label: 'Tabs', tag: 'div' },
  { type: 'accordion', label: 'Accordion', tag: 'div' },
  { type: 'counter', label: 'Counter', tag: 'div' },
  { type: 'testimonial', label: 'Testimonial', tag: 'blockquote' },
  { type: 'pricing', label: 'Pricing Table', tag: 'div' },
  { type: 'map', label: 'Map', tag: 'div' },
  { type: 'code', label: 'Code Block', tag: 'pre' },
  { type: 'divider', label: 'Divider', tag: 'hr' },
  { type: 'spacer', label: 'Spacer', tag: 'div' },
  { type: 'icon', label: 'Icon', tag: 'span' },
  { type: 'social', label: 'Social Icons', tag: 'div' },
];

const defaultContent: Record<string, string> = {
  heading: 'New Heading',
  text: 'Enter your text here. Click to edit.',
  button: 'Click Me',
  testimonial: '"This is an amazing product!"',
  counter: '100+',
  code: 'console.log("Hello World");',
};

export default function VisualBuilderPage() {
  const [nodes, setNodes] = useState<BuilderNode[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('builder-nodes');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 'root-1', type: 'section', tag: 'section', content: '', styles: { padding: '48px 32px', textAlign: 'center' }, children: [
        { id: 'h-1', type: 'heading', tag: 'h1', content: 'We Build Amazing Digital Experiences', styles: { fontSize: '2.5rem', fontWeight: '700', marginBottom: '12px' }, children: [] },
        { id: 'p-1', type: 'text', tag: 'p', content: 'We help businesses grow with beautiful websites and modern design.', styles: { color: '#6b7280', marginBottom: '24px' }, children: [] },
        { id: 'btn-1', type: 'button', tag: 'button', content: 'Get Services', styles: { backgroundColor: '#7c3aed', color: '#fff', padding: '12px 28px', borderRadius: '12px', fontWeight: '700', border: 'none' }, children: [] },
      ]},
      { id: 'root-2', type: 'section', tag: 'section', content: '', styles: { padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }, children: [
        { id: 'card-1', type: 'container', tag: 'div', content: '', styles: { padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', textAlign: 'center' }, children: [
          { id: 'ct-1', type: 'heading', tag: 'h3', content: 'Web Design', styles: { fontSize: '1rem', fontWeight: '700' }, children: [] },
          { id: 'cp-1', type: 'text', tag: 'p', content: 'Professional web design services', styles: { fontSize: '0.875rem', color: '#6b7280' }, children: [] },
        ]},
        { id: 'card-2', type: 'container', tag: 'div', content: '', styles: { padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', textAlign: 'center' }, children: [
          { id: 'ct-2', type: 'heading', tag: 'h3', content: 'Development', styles: { fontSize: '1rem', fontWeight: '700' }, children: [] },
          { id: 'cp-2', type: 'text', tag: 'p', content: 'Full-stack development', styles: { fontSize: '0.875rem', color: '#6b7280' }, children: [] },
        ]},
        { id: 'card-3', type: 'container', tag: 'div', content: '', styles: { padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', textAlign: 'center' }, children: [
          { id: 'ct-3', type: 'heading', tag: 'h3', content: 'SEO', styles: { fontSize: '1rem', fontWeight: '700' }, children: [] },
          { id: 'cp-3', type: 'text', tag: 'p', content: 'Search engine optimization', styles: { fontSize: '0.875rem', color: '#6b7280' }, children: [] },
        ]},
      ]},
    ];
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [history, setHistory] = useState<BuilderNode[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [saved, setSaved] = useState(true);
  const [dragType, setDragType] = useState<string | null>(null);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('builder-nodes', JSON.stringify(nodes));
      setSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes]);

  const pushHistory = useCallback((newNodes: BuilderNode[]) => {
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(JSON.parse(JSON.stringify(newNodes)));
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  }, [history, historyIdx]);

  const updateNodes = (newNodes: BuilderNode[]) => {
    setNodes(newNodes);
    pushHistory(newNodes);
    setSaved(false);
  };

  const undo = () => { if (historyIdx > 0) { setHistoryIdx(historyIdx - 1); setNodes(history[historyIdx - 1]); } };
  const redo = () => { if (historyIdx < history.length - 1) { setHistoryIdx(historyIdx + 1); setNodes(history[historyIdx + 1]); } };

  const findNode = (nodes: BuilderNode[], id: string): BuilderNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  };

  const selectedNode = selectedId ? findNode(nodes, selectedId) : null;

  const updateNodeInTree = (nodes: BuilderNode[], id: string, updater: (n: BuilderNode) => BuilderNode): BuilderNode[] => {
    return nodes.map(n => {
      if (n.id === id) return updater(n);
      return { ...n, children: updateNodeInTree(n.children, id, updater) };
    });
  };

  const deleteNodeFromTree = (nodes: BuilderNode[], id: string): BuilderNode[] => {
    return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: deleteNodeFromTree(n.children, id) }));
  };

  const duplicateNode = (node: BuilderNode): BuilderNode => {
    return { ...node, id: 'node-' + Date.now() + Math.random().toString(36).slice(2, 6), children: node.children.map(duplicateNode) };
  };

  const handleDrop = (e: React.DragEvent, parentId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragType) return;
    const el = ELEMENTS.find(el => el.type === dragType);
    if (!el) return;
    const newNode: BuilderNode = {
      id: 'node-' + Date.now() + Math.random().toString(36).slice(2, 6),
      type: el.type,
      tag: el.tag,
      content: defaultContent[el.type] || '',
      styles: el.type === 'spacer' ? { height: '40px' } : el.type === 'divider' ? { borderTop: '1px solid #e5e7eb', margin: '16px 0' } : {},
      children: [],
    };
    if (parentId) {
      updateNodes(updateNodeInTree(nodes, parentId, n => ({ ...n, children: [...n.children, newNode] })));
    } else {
      updateNodes([...nodes, newNode]);
    }
    setDragType(null);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    updateNodes(deleteNodeFromTree(nodes, selectedId));
    setSelectedId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedId || !selectedNode) return;
    const dup = duplicateNode(selectedNode);
    updateNodes([...nodes, dup]);
  };

  const handleStyleChange = (prop: string, value: string) => {
    if (!selectedId) return;
    updateNodes(updateNodeInTree(nodes, selectedId, n => ({ ...n, styles: { ...n.styles, [prop]: value } })));
  };

  const handleContentChange = (value: string) => {
    if (!selectedId) return;
    updateNodes(updateNodeInTree(nodes, selectedId, n => ({ ...n, content: value })));
  };

  const renderNode = (node: BuilderNode): React.ReactNode => {
    const isSelected = selectedId === node.id;
    const baseStyle: any = { ...node.styles, cursor: 'pointer', outline: isSelected ? '2px solid #7c3aed' : undefined, outlineOffset: isSelected ? '2px' : undefined, position: 'relative' as const, minHeight: node.children.length === 0 && !node.content ? '40px' : undefined };

    if (node.tag === 'hr') return <hr key={node.id} style={baseStyle} onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }} />;

    return (
      <div key={node.id} style={baseStyle} onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }} onDrop={(e) => handleDrop(e, node.id)} onDragOver={(e) => e.preventDefault()}>
        {node.content && <span contentEditable suppressContentEditableWarning onBlur={(e) => { const newContent = e.currentTarget.textContent || ''; updateNodes(updateNodeInTree(nodes, node.id, n => ({ ...n, content: newContent }))); }}>{node.content}</span>}
        {node.children.map(renderNode)}
        {node.children.length === 0 && !node.content && <div className="text-xs text-gray-300 text-center py-2">Empty {node.type}</div>}
      </div>
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && !document.activeElement?.hasAttribute('contenteditable')) handleDeleteSelected(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); handleDuplicateSelected(); }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, nodes, history, historyIdx]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
        <Link href="/dashboard" className="text-sm text-purple-600 font-medium">&larr; Back</Link>
        <div className="flex items-center gap-1.5">
          {(['desktop','tablet','mobile'] as const).map(bp => (
            <button key={bp} onClick={() => setBreakpoint(bp)} className={`w-8 h-8 rounded-lg border text-xs ${breakpoint === bp ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 hover:bg-gray-100'}`}>
              {bp === 'desktop' ? '\u{1F5A5}' : bp === 'tablet' ? '\u{1F4F1}' : '\u{1F4F2}'}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-2" />
          <button onClick={undo} className="w-8 h-8 rounded-lg border border-gray-200 text-xs hover:bg-gray-100" title="Undo (Ctrl+Z)">&#8617;</button>
          <button onClick={redo} className="w-8 h-8 rounded-lg border border-gray-200 text-xs hover:bg-gray-100" title="Redo (Ctrl+Shift+Z)">&#8618;</button>
          {selectedId && <><button onClick={handleDuplicateSelected} className="w-8 h-8 rounded-lg border border-gray-200 text-xs hover:bg-gray-100" title="Duplicate (Ctrl+D)">&#9776;</button><button onClick={handleDeleteSelected} className="w-8 h-8 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50" title="Delete">&#10005;</button></>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${saved ? 'text-green-600' : 'text-orange-500'}`}>{saved ? '\u2713 Saved' : 'Unsaved'}</span>
          <button onClick={() => { localStorage.setItem('builder-nodes', JSON.stringify(nodes)); setSaved(true); }} className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">Save</button>
          <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">Preview</button>
          <button className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-semibold">Publish</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[200px_1fr_240px] overflow-hidden">
        {/* Elements Panel */}
        <div className="bg-white border-r border-gray-200 overflow-y-auto p-3">
          <h4 className="font-bold text-xs text-gray-900 mb-2 uppercase tracking-wider">Elements</h4>
          <div className="space-y-1">
            {ELEMENTS.map(el => (
              <div key={el.type} draggable onDragStart={() => setDragType(el.type)} onDragEnd={() => setDragType(null)} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-grab hover:border-purple-400 hover:bg-purple-50 transition-all text-xs font-medium text-gray-700 active:cursor-grabbing">
                <span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[9px]">&#x2B21;</span>
                {el.label}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="font-bold text-xs text-gray-900 mb-2 uppercase tracking-wider">Layers</h4>
            <div className="space-y-0.5">
              {nodes.map((n, i) => (
                <div key={n.id} onClick={() => setSelectedId(n.id)} className={`px-2 py-1 rounded text-xs cursor-pointer ${selectedId === n.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {n.type} {n.content ? `"${n.content.slice(0, 20)}"` : `(${n.children.length} children)`}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-gray-100 overflow-y-auto p-5 flex flex-col items-center" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all min-h-[500px] ${breakpoint === 'desktop' ? 'w-full max-w-[1100px]' : breakpoint === 'tablet' ? 'w-[768px]' : 'w-[375px]'}`} onClick={() => setSelectedId(null)}>
            {nodes.map(renderNode)}
            {nodes.length === 0 && <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Drag elements here to start building</div>}
          </div>
          {dragType && <div className="mt-4 p-4 border-2 border-dashed border-purple-300 rounded-xl text-center text-purple-500 text-sm">Drop here to add to page</div>}
        </div>

        {/* Properties Panel */}
        <div className="bg-white border-l border-gray-200 overflow-y-auto p-3">
          <h4 className="font-bold text-xs text-gray-900 mb-2 uppercase tracking-wider">Properties</h4>
          {selectedNode ? (
            <div className="space-y-3">
              <div className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded">{selectedNode.type} ({selectedNode.tag})</div>
              {selectedNode.content !== undefined && selectedNode.tag !== 'hr' && (
                <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Content</label><textarea value={selectedNode.content} onChange={e => handleContentChange(e.target.value)} className="w-full h-16 rounded-lg border border-gray-200 p-2 text-xs resize-none focus:border-purple-500 focus:outline-none" /></div>
              )}
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Font Size</label><input value={selectedNode.styles.fontSize || ''} onChange={e => handleStyleChange('fontSize', e.target.value)} placeholder="e.g. 1.5rem" className="w-full h-7 rounded border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" /></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Font Weight</label><select value={selectedNode.styles.fontWeight || ''} onChange={e => handleStyleChange('fontWeight', e.target.value)} className="w-full h-7 rounded border border-gray-200 px-2 text-xs"><option value="">Default</option><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option></select></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Color</label><div className="flex gap-1"><input type="color" value={selectedNode.styles.color || '#000000'} onChange={e => handleStyleChange('color', e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer" /><input value={selectedNode.styles.color || ''} onChange={e => handleStyleChange('color', e.target.value)} className="flex-1 h-7 rounded border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" /></div></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Background</label><div className="flex gap-1"><input type="color" value={selectedNode.styles.backgroundColor || '#ffffff'} onChange={e => handleStyleChange('backgroundColor', e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer" /><input value={selectedNode.styles.backgroundColor || ''} onChange={e => handleStyleChange('backgroundColor', e.target.value)} className="flex-1 h-7 rounded border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" /></div></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Padding</label><input value={selectedNode.styles.padding || ''} onChange={e => handleStyleChange('padding', e.target.value)} placeholder="e.g. 16px" className="w-full h-7 rounded border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" /></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Margin</label><input value={selectedNode.styles.margin || ''} onChange={e => handleStyleChange('margin', e.target.value)} placeholder="e.g. 0 0 12px 0" className="w-full h-7 rounded border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" /></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Border Radius</label><input value={selectedNode.styles.borderRadius || ''} onChange={e => handleStyleChange('borderRadius', e.target.value)} placeholder="e.g. 12px" className="w-full h-7 rounded border border-gray-200 px-2 text-xs focus:border-purple-500 focus:outline-none" /></div>
              <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Text Align</label><div className="flex gap-1">{['left','center','right'].map(a => (<button key={a} onClick={() => handleStyleChange('textAlign', a)} className={`flex-1 h-7 rounded border text-[10px] font-bold ${selectedNode.styles.textAlign === a ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-200'}`}>{a[0].toUpperCase()}</button>))}</div></div>
              <div className="pt-2 border-t border-gray-100 flex gap-1">
                <button onClick={handleDuplicateSelected} className="flex-1 h-7 rounded border border-gray-200 text-[10px] font-semibold hover:bg-gray-50">Duplicate</button>
                <button onClick={handleDeleteSelected} className="flex-1 h-7 rounded border border-red-200 text-[10px] font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ) : <p className="text-xs text-gray-400">Click an element to edit. Drag from the left panel to add new elements.</p>}
        </div>
      </div>
    </div>
  );
}
