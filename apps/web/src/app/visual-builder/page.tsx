'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ============================================================
// TYPES
// ============================================================
interface BuilderNode {
  id: string;
  type: string;
  tag: string;
  content: string;
  styles: Record<string, string>;
  children: BuilderNode[];
  locked?: boolean;
  hidden?: boolean;
  name?: string;
}

// ============================================================
// COMPONENT LIBRARY
// ============================================================
const COMPONENT_CATEGORIES: Record<string, Array<{ name: string; nodes: BuilderNode[] }>> = {
  'Hero': [
    { name: 'Hero Centered', nodes: [{id:'h1',type:'section',tag:'section',content:'',styles:{padding:'80px 32px',textAlign:'center',background:'linear-gradient(135deg,#667eea,#764ba2)'},children:[{id:'h1t',type:'heading',tag:'h1',content:'Build Something Amazing',styles:{fontSize:'3.5rem',fontWeight:'800',color:'#fff',marginBottom:'16px',letterSpacing:'-0.02em'},children:[]},{id:'h1p',type:'text',tag:'p',content:'The all-in-one platform for modern teams to ship faster.',styles:{fontSize:'1.2rem',color:'rgba(255,255,255,0.85)',maxWidth:'600px',margin:'0 auto 32px'},children:[]},{id:'h1b',type:'button',tag:'button',content:'Get Started Free',styles:{background:'#fff',color:'#764ba2',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',border:'none',fontSize:'1rem'},children:[]}]}] },
    { name: 'Hero Split', nodes: [{id:'hs1',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'40px',padding:'80px 48px',alignItems:'center'},children:[{id:'hs1l',type:'container',tag:'div',content:'',styles:{},children:[{id:'hs1h',type:'heading',tag:'h1',content:'Design Without Limits',styles:{fontSize:'3rem',fontWeight:'800',lineHeight:'1.1',marginBottom:'16px'},children:[]},{id:'hs1p',type:'text',tag:'p',content:'Create stunning websites with our drag-and-drop builder. No code required.',styles:{color:'#6b7280',marginBottom:'24px',fontSize:'1.1rem'},children:[]},{id:'hs1b',type:'button',tag:'button',content:'Start Building',styles:{background:'#7c3aed',color:'#fff',padding:'14px 28px',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]},{id:'hs1r',type:'container',tag:'div',content:'',styles:{background:'linear-gradient(135deg,#f0e6ff,#e0d4ff)',borderRadius:'24px',height:'400px',display:'flex',alignItems:'center',justifyContent:'center'},children:[{id:'hs1img',type:'text',tag:'span',content:'Image Placeholder',styles:{color:'#7c3aed',fontSize:'1.2rem'},children:[]}]}]}] },
    { name: 'Hero Minimal', nodes: [{id:'hm1',type:'section',tag:'section',content:'',styles:{padding:'120px 32px 80px',textAlign:'center',maxWidth:'800px',margin:'0 auto'},children:[{id:'hm1t',type:'heading',tag:'h1',content:'Less is More',styles:{fontSize:'4rem',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'20px'},children:[]},{id:'hm1p',type:'text',tag:'p',content:'A minimalist approach to web design that puts your content first.',styles:{fontSize:'1.25rem',color:'#6b7280',marginBottom:'40px'},children:[]},{id:'hm1b',type:'container',tag:'div',content:'',styles:{display:'flex',gap:'12px',justifyContent:'center'},children:[{id:'hm1b1',type:'button',tag:'button',content:'Get Started',styles:{background:'#111',color:'#fff',padding:'14px 28px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]},{id:'hm1b2',type:'button',tag:'button',content:'Learn More',styles:{background:'transparent',color:'#111',padding:'14px 28px',borderRadius:'8px',fontWeight:'600',border:'1px solid #e5e7eb'},children:[]}]}]}] },
    { name: 'Hero Gradient', nodes: [{id:'hg1',type:'section',tag:'section',content:'',styles:{padding:'100px 32px',textAlign:'center',background:'linear-gradient(180deg,#0f172a,#1e293b)',color:'#fff'},children:[{id:'hg1t',type:'heading',tag:'h1',content:'The Future is Now',styles:{fontSize:'3.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'hg1p',type:'text',tag:'p',content:'Next-generation tools for next-generation creators.',styles:{color:'rgba(255,255,255,0.7)',fontSize:'1.2rem',marginBottom:'32px'},children:[]},{id:'hg1b',type:'button',tag:'button',content:'Join Waitlist',styles:{background:'linear-gradient(135deg,#60a5fa,#a78bfa)',color:'#fff',padding:'14px 32px',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]}] },
  ],
  'Navbar': [
    { name: 'Navbar Simple', nodes: [{id:'nav1',type:'section',tag:'nav',content:'',styles:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',borderBottom:'1px solid #e5e7eb'},children:[{id:'nav1l',type:'text',tag:'span',content:'Brand',styles:{fontWeight:'800',fontSize:'1.2rem'},children:[]},{id:'nav1m',type:'container',tag:'div',content:'',styles:{display:'flex',gap:'24px'},children:[{id:'nav1i1',type:'text',tag:'a',content:'Home',styles:{color:'#374151',fontSize:'0.9rem',fontWeight:'500'},children:[]},{id:'nav1i2',type:'text',tag:'a',content:'About',styles:{color:'#374151',fontSize:'0.9rem',fontWeight:'500'},children:[]},{id:'nav1i3',type:'text',tag:'a',content:'Services',styles:{color:'#374151',fontSize:'0.9rem',fontWeight:'500'},children:[]},{id:'nav1i4',type:'text',tag:'a',content:'Contact',styles:{color:'#374151',fontSize:'0.9rem',fontWeight:'500'},children:[]}]},{id:'nav1b',type:'button',tag:'button',content:'Get Started',styles:{background:'#7c3aed',color:'#fff',padding:'8px 16px',borderRadius:'8px',fontWeight:'600',border:'none',fontSize:'0.85rem'},children:[]}]}] },
    { name: 'Navbar Dark', nodes: [{id:'nav2',type:'section',tag:'nav',content:'',styles:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',background:'#0f172a'},children:[{id:'nav2l',type:'text',tag:'span',content:'OmniBuilder',styles:{fontWeight:'800',fontSize:'1.1rem',color:'#fff'},children:[]},{id:'nav2m',type:'container',tag:'div',content:'',styles:{display:'flex',gap:'24px'},children:[{id:'nav2i1',type:'text',tag:'a',content:'Features',styles:{color:'rgba(255,255,255,0.7)',fontSize:'0.9rem'},children:[]},{id:'nav2i2',type:'text',tag:'a',content:'Pricing',styles:{color:'rgba(255,255,255,0.7)',fontSize:'0.9rem'},children:[]},{id:'nav2i3',type:'text',tag:'a',content:'Docs',styles:{color:'rgba(255,255,255,0.7)',fontSize:'0.9rem'},children:[]}]},{id:'nav2b',type:'button',tag:'button',content:'Sign Up',styles:{background:'#7c3aed',color:'#fff',padding:'8px 16px',borderRadius:'8px',fontWeight:'600',border:'none',fontSize:'0.85rem'},children:[]}]}] },
  ],
  'Features': [
    { name: 'Features Grid 3', nodes: [{id:'fg1',type:'section',tag:'section',content:'',styles:{padding:'64px 32px'},children:[{id:'fg1h',type:'heading',tag:'h2',content:'Why Choose Us',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'40px'},children:[]},{id:'fg1g',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',maxWidth:'1000px',margin:'0 auto'},children:[{id:'fg1c1',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb',textAlign:'center'},children:[{id:'fg1c1h',type:'heading',tag:'h3',content:'Lightning Fast',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'fg1c1p',type:'text',tag:'p',content:'Optimized for speed with sub-second load times.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'fg1c2',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb',textAlign:'center'},children:[{id:'fg1c2h',type:'heading',tag:'h3',content:'Fully Responsive',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'fg1c2p',type:'text',tag:'p',content:'Looks perfect on every screen size.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'fg1c3',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb',textAlign:'center'},children:[{id:'fg1c3h',type:'heading',tag:'h3',content:'SEO Optimized',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'fg1c3p',type:'text',tag:'p',content:'Built-in SEO tools for maximum visibility.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]}]}]}] },
  ],
  'Pricing': [
    { name: 'Pricing 3 Tier', nodes: [{id:'pr1',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',textAlign:'center'},children:[{id:'pr1h',type:'heading',tag:'h2',content:'Simple Pricing',styles:{fontSize:'2rem',fontWeight:'800',marginBottom:'8px'},children:[]},{id:'pr1p',type:'text',tag:'p',content:'Choose the plan that fits your needs',styles:{color:'#6b7280',marginBottom:'40px'},children:[]},{id:'pr1g',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',maxWidth:'900px',margin:'0 auto'},children:[{id:'pr1c1',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb'},children:[{id:'pr1c1n',type:'text',tag:'p',content:'Starter',styles:{fontWeight:'600',marginBottom:'8px'},children:[]},{id:'pr1c1pr',type:'heading',tag:'h3',content:'$9/mo',styles:{fontSize:'2.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'pr1c1b',type:'button',tag:'button',content:'Get Started',styles:{width:'100%',background:'#f3f4f6',color:'#374151',padding:'12px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]},{id:'pr1c2',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'2px solid #7c3aed',background:'#faf5ff'},children:[{id:'pr1c2n',type:'text',tag:'p',content:'Pro',styles:{fontWeight:'600',color:'#7c3aed',marginBottom:'8px'},children:[]},{id:'pr1c2pr',type:'heading',tag:'h3',content:'$29/mo',styles:{fontSize:'2.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'pr1c2b',type:'button',tag:'button',content:'Get Started',styles:{width:'100%',background:'#7c3aed',color:'#fff',padding:'12px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]},{id:'pr1c3',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb'},children:[{id:'pr1c3n',type:'text',tag:'p',content:'Enterprise',styles:{fontWeight:'600',marginBottom:'8px'},children:[]},{id:'pr1c3pr',type:'heading',tag:'h3',content:'$99/mo',styles:{fontSize:'2.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'pr1c3b',type:'button',tag:'button',content:'Contact Sales',styles:{width:'100%',background:'#f3f4f6',color:'#374151',padding:'12px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]}]}]}] },
  ],
  'Testimonials': [
    { name: 'Testimonial Cards', nodes: [{id:'ts1',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',background:'#f9fafb'},children:[{id:'ts1h',type:'heading',tag:'h2',content:'What Our Customers Say',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'40px'},children:[]},{id:'ts1g',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',maxWidth:'1000px',margin:'0 auto'},children:[{id:'ts1c1',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',background:'#fff',border:'1px solid #e5e7eb'},children:[{id:'ts1c1q',type:'text',tag:'p',content:'This tool transformed how we build websites. Incredibly intuitive.',styles:{color:'#374151',marginBottom:'16px',fontStyle:'italic'},children:[]},{id:'ts1c1a',type:'text',tag:'p',content:'Sarah Johnson, CEO',styles:{fontWeight:'600',fontSize:'0.85rem'},children:[]}]},{id:'ts1c2',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',background:'#fff',border:'1px solid #e5e7eb'},children:[{id:'ts1c2q',type:'text',tag:'p',content:'Saved us hundreds of hours in development time.',styles:{color:'#374151',marginBottom:'16px',fontStyle:'italic'},children:[]},{id:'ts1c2a',type:'text',tag:'p',content:'Mike Chen, CTO',styles:{fontWeight:'600',fontSize:'0.85rem'},children:[]}]},{id:'ts1c3',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',background:'#fff',border:'1px solid #e5e7eb'},children:[{id:'ts1c3q',type:'text',tag:'p',content:'The best visual builder I have ever used. Period.',styles:{color:'#374151',marginBottom:'16px',fontStyle:'italic'},children:[]},{id:'ts1c3a',type:'text',tag:'p',content:'Emma Davis, Designer',styles:{fontWeight:'600',fontSize:'0.85rem'},children:[]}]}]}]}] },
  ],
  'Footer': [
    { name: 'Footer Simple', nodes: [{id:'ft1',type:'section',tag:'footer',content:'',styles:{padding:'48px 32px',background:'#0f172a',color:'#fff'},children:[{id:'ft1g',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'40px',maxWidth:'1000px',margin:'0 auto'},children:[{id:'ft1c1',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft1c1h',type:'text',tag:'span',content:'OmniBuilder',styles:{fontWeight:'800',fontSize:'1.2rem'},children:[]},{id:'ft1c1p',type:'text',tag:'p',content:'Building the future of web design.',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',marginTop:'8px'},children:[]}]},{id:'ft1c2',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft1c2h',type:'text',tag:'p',content:'Product',styles:{fontWeight:'700',fontSize:'0.85rem',marginBottom:'12px'},children:[]},{id:'ft1c2l1',type:'text',tag:'a',content:'Features',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]},{id:'ft1c2l2',type:'text',tag:'a',content:'Pricing',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]}]},{id:'ft1c3',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft1c3h',type:'text',tag:'p',content:'Company',styles:{fontWeight:'700',fontSize:'0.85rem',marginBottom:'12px'},children:[]},{id:'ft1c3l1',type:'text',tag:'a',content:'About',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]},{id:'ft1c3l2',type:'text',tag:'a',content:'Blog',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]}]},{id:'ft1c4',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft1c4h',type:'text',tag:'p',content:'Legal',styles:{fontWeight:'700',fontSize:'0.85rem',marginBottom:'12px'},children:[]},{id:'ft1c4l1',type:'text',tag:'a',content:'Privacy',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]},{id:'ft1c4l2',type:'text',tag:'a',content:'Terms',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]}]}]}]}] },
  ],
  'CTA': [
    { name: 'CTA Banner', nodes: [{id:'cta1',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',borderRadius:'24px',margin:'32px',textAlign:'center'},children:[{id:'cta1h',type:'heading',tag:'h2',content:'Ready to Get Started?',styles:{fontSize:'2.2rem',fontWeight:'800',color:'#fff',marginBottom:'12px'},children:[]},{id:'cta1p',type:'text',tag:'p',content:'Join thousands of creators building with OmniBuilder.',styles:{color:'rgba(255,255,255,0.8)',marginBottom:'24px'},children:[]},{id:'cta1b',type:'button',tag:'button',content:'Start Free Trial',styles:{background:'#fff',color:'#7c3aed',padding:'14px 32px',borderRadius:'10px',fontWeight:'700',border:'none',fontSize:'1rem'},children:[]}]}] },
  ],
  'FAQ': [
    { name: 'FAQ Accordion', nodes: [{id:'faq1',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',maxWidth:'700px',margin:'0 auto'},children:[{id:'faq1h',type:'heading',tag:'h2',content:'Frequently Asked Questions',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'40px'},children:[]},{id:'faq1i1',type:'container',tag:'div',content:'',styles:{padding:'20px',borderBottom:'1px solid #e5e7eb'},children:[{id:'faq1q1',type:'heading',tag:'h3',content:'How does OmniBuilder work?',styles:{fontSize:'1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'faq1a1',type:'text',tag:'p',content:'OmniBuilder uses a visual drag-and-drop interface to let you build websites without code.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'faq1i2',type:'container',tag:'div',content:'',styles:{padding:'20px',borderBottom:'1px solid #e5e7eb'},children:[{id:'faq1q2',type:'heading',tag:'h3',content:'Can I import existing websites?',styles:{fontSize:'1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'faq1a2',type:'text',tag:'p',content:'Yes! You can import from ZIP, Git, URL, or upload HTML files directly.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'faq1i3',type:'container',tag:'div',content:'',styles:{padding:'20px'},children:[{id:'faq1q3',type:'heading',tag:'h3',content:'Is there a free plan?',styles:{fontSize:'1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'faq1a3',type:'text',tag:'p',content:'Yes, we offer a generous free tier with unlimited pages and basic components.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]}]}] },
  ],
  'Contact': [
    { name: 'Contact Form', nodes: [{id:'cf1',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',maxWidth:'600px',margin:'0 auto'},children:[{id:'cf1h',type:'heading',tag:'h2',content:'Get in Touch',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'32px'},children:[]},{id:'cf1f',type:'container',tag:'div',content:'',styles:{display:'grid',gap:'16px'},children:[{id:'cf1n',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'},children:[{id:'cf1fn',type:'container',tag:'div',content:'',styles:{height:'48px',borderRadius:'10px',border:'1px solid #e5e7eb',background:'#f9fafb'},children:[]},{id:'cf1fe',type:'container',tag:'div',content:'',styles:{height:'48px',borderRadius:'10px',border:'1px solid #e5e7eb',background:'#f9fafb'},children:[]}]},{id:'cf1fm',type:'container',tag:'div',content:'',styles:{height:'120px',borderRadius:'10px',border:'1px solid #e5e7eb',background:'#f9fafb'},children:[]},{id:'cf1fb',type:'button',tag:'button',content:'Send Message',styles:{height:'48px',background:'#7c3aed',color:'#fff',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]}]}] },
  ],
  'Layout': [
    { name: '2 Column', nodes: [{id:'l2c',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',padding:'32px'},children:[{id:'l2cl',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'200px'},children:[{id:'l2clp',type:'text',tag:'p',content:'Left column',styles:{color:'#6b7280'},children:[]}]},{id:'l2cr',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'200px'},children:[{id:'l2crp',type:'text',tag:'p',content:'Right column',styles:{color:'#6b7280'},children:[]}]}]}] },
    { name: '3 Column', nodes: [{id:'l3c',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',padding:'32px'},children:[{id:'l3c1',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'150px'},children:[]},{id:'l3c2',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'150px'},children:[]},{id:'l3c3',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'150px'},children:[]}]}] },
  ],
  'Elements': [
    { name: 'Heading', nodes: [{id:'el-h',type:'heading',tag:'h2',content:'New Heading',styles:{fontSize:'1.8rem',fontWeight:'700'},children:[]}] },
    { name: 'Paragraph', nodes: [{id:'el-p',type:'text',tag:'p',content:'Add your text here. Click to edit.',styles:{color:'#374151',lineHeight:'1.6'},children:[]}] },
    { name: 'Button', nodes: [{id:'el-b',type:'button',tag:'button',content:'Click Me',styles:{background:'#7c3aed',color:'#fff',padding:'12px 24px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}] },
    { name: 'Image Placeholder', nodes: [{id:'el-i',type:'container',tag:'div',content:'',styles:{width:'100%',height:'200px',background:'#f3f4f6',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af'},children:[{id:'el-it',type:'text',tag:'span',content:'[Image]',styles:{},children:[]}]}] },
    { name: 'Divider', nodes: [{id:'el-d',type:'container',tag:'div',content:'',styles:{borderTop:'1px solid #e5e7eb',margin:'24px 0',height:'1px'},children:[]}] },
    { name: 'Spacer', nodes: [{id:'el-s',type:'container',tag:'div',content:'',styles:{height:'48px'},children:[]}] },
    { name: 'Container', nodes: [{id:'el-c',type:'container',tag:'div',content:'',styles:{padding:'24px',border:'1px dashed #d1d5db',borderRadius:'12px',minHeight:'100px'},children:[]}] },
    { name: 'Section', nodes: [{id:'el-sec',type:'section',tag:'section',content:'',styles:{padding:'48px 32px'},children:[]}] },
  ],
};

const TEMPLATES: Record<string, string[]> = {
  'SaaS Landing': ['Hero Gradient', 'Features Grid 3', 'Pricing 3 Tier', 'Testimonial Cards', 'CTA Banner', 'Footer Simple'],
  'Agency': ['Navbar Simple', 'Hero Split', 'Features Grid 3', 'Testimonial Cards', 'Contact Form', 'Footer Simple'],
  'Portfolio': ['Navbar Dark', 'Hero Minimal', 'Features Grid 3', 'CTA Banner', 'Footer Simple'],
  'Business': ['Navbar Simple', 'Hero Centered', 'Features Grid 3', 'Pricing 3 Tier', 'FAQ Accordion', 'Footer Simple'],
  'Startup': ['Navbar Dark', 'Hero Gradient', 'Features Grid 3', 'Testimonial Cards', 'Pricing 3 Tier', 'CTA Banner', 'Footer Simple'],
};

// ============================================================
// BUILDER PAGE
// ============================================================
export default function VisualBuilderPage() {
  const [nodes, setNodes] = useState<BuilderNode[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('builder-nodes');
      if (saved) try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [leftTab, setLeftTab] = useState<'components' | 'elements' | 'templates' | 'pages'>('components');
  const [history, setHistory] = useState<BuilderNode[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [saved, setSaved] = useState(true);
  const [searchComp, setSearchComp] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>('Hero');

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('builder-nodes', JSON.stringify(nodes));
      setSaved(true);
    }, 800);
    return () => clearTimeout(t);
  }, [nodes]);

  const pushHistory = (n: BuilderNode[]) => {
    const h = history.slice(0, historyIdx + 1);
    h.push(JSON.parse(JSON.stringify(n)));
    setHistory(h);
    setHistoryIdx(h.length - 1);
  };

  const updateNodes = (n: BuilderNode[]) => {
    setNodes(n);
    pushHistory(n);
    setSaved(false);
  };

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setNodes(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setNodes(history[historyIdx + 1]);
    }
  };

  const findNode = (ns: BuilderNode[], id: string): BuilderNode | null => {
    for (const n of ns) {
      if (n.id === id) return n;
      const f = findNode(n.children, id);
      if (f) return f;
    }
    return null;
  };

  const updateInTree = (ns: BuilderNode[], id: string, fn: (n: BuilderNode) => BuilderNode): BuilderNode[] => {
    return ns.map(n => n.id === id ? fn(n) : { ...n, children: updateInTree(n.children, id, fn) });
  };

  const deleteFromTree = (ns: BuilderNode[], id: string): BuilderNode[] => {
    return ns.filter(n => n.id !== id).map(n => ({ ...n, children: deleteFromTree(n.children, id) }));
  };

  const cloneNode = (n: BuilderNode): BuilderNode => ({
    ...n,
    id: 'n-' + Date.now() + Math.random().toString(36).slice(2, 5),
    children: n.children.map(cloneNode),
  });

  const selectedNode = selectedId ? findNode(nodes, selectedId) : null;

  const addComponent = (compNodes: BuilderNode[]) => {
    const cloned = compNodes.map(n => cloneNode(n));
    updateNodes([...nodes, ...cloned]);
  };

  const applyTemplate = (templateName: string) => {
    const compNames = TEMPLATES[templateName];
    if (!compNames) return;
    const allNodes: BuilderNode[] = [];
    for (const name of compNames) {
      for (const cat of Object.values(COMPONENT_CATEGORIES)) {
        const comp = cat.find(c => c.name === name);
        if (comp) {
          allNodes.push(...comp.nodes.map(cloneNode));
          break;
        }
      }
    }
    updateNodes(allNodes);
  };

  const handleStyleChange = (prop: string, value: string) => {
    if (!selectedId) return;
    updateNodes(updateInTree(nodes, selectedId, n => ({ ...n, styles: { ...n.styles, [prop]: value } })));
  };

  const handleContentChange = (value: string) => {
    if (!selectedId) return;
    updateNodes(updateInTree(nodes, selectedId, n => ({ ...n, content: value })));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    updateNodes(deleteFromTree(nodes, selectedId));
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const node = findNode(nodes, selectedId);
    if (node) updateNodes([...nodes, cloneNode(node)]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const el = e.target as HTMLElement;
      if (el.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); handleDuplicate(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId) handleDelete(); }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const renderNode = (node: BuilderNode): React.ReactNode => {
    if (node.hidden) return null;
    const isSel = selectedId === node.id;
    const style: React.CSSProperties = {
      ...(node.styles as React.CSSProperties),
      cursor: 'pointer',
      outline: isSel ? '2px solid #7c3aed' : undefined,
      outlineOffset: '2px',
      position: 'relative',
      minHeight: !node.content && node.children.length === 0 ? '40px' : undefined,
      opacity: node.locked ? 0.7 : 1,
    };

    return (
      <div
        key={node.id}
        style={style}
        onClick={e => { e.stopPropagation(); if (!node.locked) setSelectedId(node.id); }}
      >
        {node.content && (
          <span
            contentEditable={!node.locked}
            suppressContentEditableWarning
            onBlur={e => {
              if (!node.locked) {
                const newContent = e.currentTarget.textContent || '';
                setNodes(prev => updateInTree(prev, node.id, n => ({ ...n, content: newContent })));
                setSaved(false);
              }
            }}
          >
            {node.content}
          </span>
        )}
        {node.children.map(renderNode)}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 h-11">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-purple-600 font-medium text-xs">Back</Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500 font-medium">Visual Builder</span>
        </div>
        <div className="flex items-center gap-1">
          {(['desktop', 'tablet', 'mobile'] as const).map(bp => (
            <button
              key={bp}
              onClick={() => setBreakpoint(bp)}
              className={`w-7 h-7 rounded text-[10px] ${breakpoint === bp ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {bp[0].toUpperCase()}
            </button>
          ))}
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <button onClick={undo} className="w-7 h-7 rounded bg-gray-100 text-xs hover:bg-gray-200" title="Undo">U</button>
          <button onClick={redo} className="w-7 h-7 rounded bg-gray-100 text-xs hover:bg-gray-200" title="Redo">R</button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${saved ? 'text-green-600' : 'text-orange-500'}`}>{saved ? 'Saved' : 'Unsaved'}</span>
          <button className="h-7 px-2.5 rounded bg-gray-100 text-[11px] font-semibold hover:bg-gray-200">Preview</button>
          <button className="h-7 px-2.5 rounded bg-purple-600 text-white text-[11px] font-semibold">Publish</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[260px_1fr_260px] overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100 px-1 pt-1">
            {(['components', 'elements', 'templates', 'pages'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`flex-1 py-1.5 text-[10px] font-semibold capitalize rounded-t ${leftTab === tab ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {leftTab === 'components' && (
              <div>
                <input
                  value={searchComp}
                  onChange={e => setSearchComp(e.target.value)}
                  placeholder="Search components..."
                  className="w-full h-7 rounded border border-gray-200 px-2 text-[11px] mb-2 focus:border-purple-500 focus:outline-none"
                />
                {Object.entries(COMPONENT_CATEGORIES)
                  .filter(([cat]) => !searchComp || cat.toLowerCase().includes(searchComp.toLowerCase()))
                  .map(([cat, comps]) => (
                    <div key={cat} className="mb-1">
                      <button
                        onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
                        className="w-full flex justify-between items-center px-2 py-1.5 rounded text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {cat} <span className="text-[10px] text-gray-400">{comps.length}</span>
                      </button>
                      {expandedCat === cat && (
                        <div className="pl-2 space-y-0.5">
                          {comps.map(comp => (
                            <button
                              key={comp.name}
                              onClick={() => addComponent(comp.nodes)}
                              className="w-full text-left px-2 py-1.5 rounded text-[11px] text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-all"
                            >
                              {comp.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
            {leftTab === 'elements' && (
              <div className="space-y-0.5">
                {COMPONENT_CATEGORIES['Elements'].map(el => (
                  <button
                    key={el.name}
                    onClick={() => addComponent(el.nodes)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[9px]">+</span>
                    {el.name}
                  </button>
                ))}
              </div>
            )}
            {leftTab === 'templates' && (
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 px-1">Click to apply a full page template</p>
                {Object.keys(TEMPLATES).map(name => (
                  <button
                    key={name}
                    onClick={() => {
                      if (nodes.length > 0 && !confirm('Replace current content with template?')) return;
                      applyTemplate(name);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    <div className="text-[11px] font-semibold text-gray-800">{name}</div>
                    <div className="text-[10px] text-gray-400">{TEMPLATES[name].length} sections</div>
                  </button>
                ))}
              </div>
            )}
            {leftTab === 'pages' && (
              <div className="text-[11px] text-gray-500 p-2">
                Pages panel: switch between pages in your project. Use the Pages module to create and manage pages.
              </div>
            )}
          </div>
        </div>

        {/* CANVAS */}
        <div className="overflow-y-auto p-4 flex flex-col items-center" onClick={() => setSelectedId(null)}>
          <div
            className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all min-h-[500px] ${
              breakpoint === 'desktop' ? 'w-full max-w-[1200px]' : breakpoint === 'tablet' ? 'w-[768px]' : 'w-[375px]'
            }`}
          >
            {nodes.length > 0 ? (
              nodes.map(renderNode)
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <p className="text-2xl mb-2">+</p>
                <p className="text-sm font-medium">Start building your page</p>
                <p className="text-xs mt-1">Add components from the left panel or apply a template</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Properties */}
          <div className="flex-1 overflow-y-auto p-3">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Properties</h4>
            {selectedNode ? (
              <div className="space-y-2.5">
                <div className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {selectedNode.name || selectedNode.type} - {selectedNode.tag}
                </div>
                {selectedNode.content !== undefined && (
                  <div>
                    <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Content</label>
                    <textarea
                      value={selectedNode.content}
                      onChange={e => handleContentChange(e.target.value)}
                      className="w-full h-14 rounded border border-gray-200 p-1.5 text-[11px] resize-none focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Font Size</label>
                  <input value={selectedNode.styles.fontSize || ''} onChange={e => handleStyleChange('fontSize', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" placeholder="1rem" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Font Weight</label>
                  <select value={selectedNode.styles.fontWeight || ''} onChange={e => handleStyleChange('fontWeight', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1 text-[11px]">
                    <option value="">Default</option><option>400</option><option>500</option><option>600</option><option>700</option><option>800</option><option>900</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Color</label>
                  <div className="flex gap-1">
                    <input type="color" value={selectedNode.styles.color || '#000000'} onChange={e => handleStyleChange('color', e.target.value)} className="w-6 h-6 rounded border-0 cursor-pointer" />
                    <input value={selectedNode.styles.color || ''} onChange={e => handleStyleChange('color', e.target.value)} className="flex-1 h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Background</label>
                  <input value={selectedNode.styles.background || selectedNode.styles.backgroundColor || ''} onChange={e => handleStyleChange('background', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Padding</label>
                  <input value={selectedNode.styles.padding || ''} onChange={e => handleStyleChange('padding', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Margin</label>
                  <input value={selectedNode.styles.margin || ''} onChange={e => handleStyleChange('margin', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Border Radius</label>
                  <input value={selectedNode.styles.borderRadius || ''} onChange={e => handleStyleChange('borderRadius', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Display</label>
                  <select value={selectedNode.styles.display || ''} onChange={e => handleStyleChange('display', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1 text-[11px]">
                    <option value="">Default</option><option>flex</option><option>grid</option><option>block</option><option>inline-flex</option><option>none</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Gap</label>
                  <input value={selectedNode.styles.gap || ''} onChange={e => handleStyleChange('gap', e.target.value)} className="w-full h-6 rounded border border-gray-200 px-1.5 text-[11px] focus:border-purple-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-gray-500 uppercase mb-0.5">Text Align</label>
                  <div className="flex gap-0.5">
                    {['left', 'center', 'right'].map(a => (
                      <button
                        key={a}
                        onClick={() => handleStyleChange('textAlign', a)}
                        className={`flex-1 h-6 rounded border text-[9px] font-bold ${selectedNode.styles.textAlign === a ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        {a[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 flex gap-1">
                  <button onClick={handleDuplicate} className="flex-1 h-6 rounded border border-gray-200 text-[10px] font-semibold hover:bg-gray-50">Duplicate</button>
                  <button onClick={handleDelete} className="flex-1 h-6 rounded border border-red-200 text-[10px] font-semibold text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">Select an element to edit properties</p>
            )}
          </div>

          {/* Layers */}
          <div className="border-t border-gray-200 h-[240px] overflow-y-auto p-2">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Layers</h4>
            <div className="space-y-0.5">
              {nodes.map(n => (
                <div key={n.id}>
                  <div
                    onClick={() => setSelectedId(n.id)}
                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer text-[11px] ${selectedId === n.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span className="text-[9px] text-gray-400">*</span>
                    <span className="flex-1 truncate">
                      {n.name || n.type}{n.content ? `: "${n.content.slice(0, 15)}"` : ''}
                    </span>
                    {n.children.length > 0 && <span className="text-[9px] text-gray-300">({n.children.length})</span>}
                  </div>
                  {n.children.length > 0 && (
                    <div className="pl-3">
                      {n.children.map(c => (
                        <div
                          key={c.id}
                          onClick={e => { e.stopPropagation(); setSelectedId(c.id); }}
                          className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer text-[10px] ${selectedId === c.id ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          <span className="truncate">
                            {c.name || c.type}{c.content ? `: "${c.content.slice(0, 12)}"` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
