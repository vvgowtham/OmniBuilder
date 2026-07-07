'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface BNode {
  id: string;
  type: string;
  tag: string;
  content: string;
  styles: Record<string, string>;
  children: BNode[];
  locked?: boolean;
  hidden?: boolean;
  name?: string;
}

// === COMPONENT DATA ===
const CATS: Record<string, Array<{name:string;nodes:BNode[]}>> = {
'Hero':[
{name:'Hero Centered',nodes:[{id:'hc',type:'section',tag:'section',content:'',styles:{padding:'80px 32px',textAlign:'center',background:'linear-gradient(135deg,#667eea,#764ba2)'},children:[{id:'hc1',type:'heading',tag:'h1',content:'Build Something Amazing',styles:{fontSize:'3.5rem',fontWeight:'800',color:'#fff',marginBottom:'16px'},children:[]},{id:'hc2',type:'text',tag:'p',content:'The all-in-one platform for modern teams.',styles:{fontSize:'1.2rem',color:'rgba(255,255,255,0.85)',marginBottom:'32px'},children:[]},{id:'hc3',type:'button',tag:'button',content:'Get Started Free',styles:{background:'#fff',color:'#764ba2',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',border:'none'},children:[]}]}]},
{name:'Hero Split',nodes:[{id:'hs',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'40px',padding:'80px 48px',alignItems:'center'},children:[{id:'hs1',type:'container',tag:'div',content:'',styles:{},children:[{id:'hs1a',type:'heading',tag:'h1',content:'Design Without Limits',styles:{fontSize:'3rem',fontWeight:'800',lineHeight:'1.1',marginBottom:'16px'},children:[]},{id:'hs1b',type:'text',tag:'p',content:'Create stunning websites with drag-and-drop.',styles:{color:'#6b7280',marginBottom:'24px'},children:[]},{id:'hs1c',type:'button',tag:'button',content:'Start Building',styles:{background:'#7c3aed',color:'#fff',padding:'14px 28px',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]},{id:'hs2',type:'container',tag:'div',content:'',styles:{background:'linear-gradient(135deg,#f0e6ff,#e0d4ff)',borderRadius:'24px',height:'350px'},children:[]}]}]},
{name:'Hero Dark',nodes:[{id:'hd',type:'section',tag:'section',content:'',styles:{padding:'100px 32px',textAlign:'center',background:'#0f172a',color:'#fff'},children:[{id:'hd1',type:'heading',tag:'h1',content:'The Future is Now',styles:{fontSize:'3.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'hd2',type:'text',tag:'p',content:'Next-gen tools for next-gen creators.',styles:{color:'rgba(255,255,255,0.7)',marginBottom:'32px'},children:[]},{id:'hd3',type:'button',tag:'button',content:'Join Waitlist',styles:{background:'#7c3aed',color:'#fff',padding:'14px 32px',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]}]},
{name:'Hero Minimal',nodes:[{id:'hm',type:'section',tag:'section',content:'',styles:{padding:'120px 32px',textAlign:'center',maxWidth:'800px',margin:'0 auto'},children:[{id:'hm1',type:'heading',tag:'h1',content:'Less is More',styles:{fontSize:'4rem',fontWeight:'900',marginBottom:'20px'},children:[]},{id:'hm2',type:'text',tag:'p',content:'Minimalist web design that puts content first.',styles:{fontSize:'1.25rem',color:'#6b7280',marginBottom:'40px'},children:[]}]}]},
],
'Navbar':[
{name:'Navbar Light',nodes:[{id:'nl',type:'section',tag:'nav',content:'',styles:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',borderBottom:'1px solid #e5e7eb'},children:[{id:'nl1',type:'text',tag:'span',content:'Brand',styles:{fontWeight:'800',fontSize:'1.2rem'},children:[]},{id:'nl2',type:'container',tag:'div',content:'',styles:{display:'flex',gap:'24px'},children:[{id:'nl2a',type:'text',tag:'a',content:'Home',styles:{color:'#374151',fontSize:'0.9rem'},children:[]},{id:'nl2b',type:'text',tag:'a',content:'About',styles:{color:'#374151',fontSize:'0.9rem'},children:[]},{id:'nl2c',type:'text',tag:'a',content:'Services',styles:{color:'#374151',fontSize:'0.9rem'},children:[]},{id:'nl2d',type:'text',tag:'a',content:'Contact',styles:{color:'#374151',fontSize:'0.9rem'},children:[]}]},{id:'nl3',type:'button',tag:'button',content:'Get Started',styles:{background:'#7c3aed',color:'#fff',padding:'8px 16px',borderRadius:'8px',fontWeight:'600',border:'none',fontSize:'0.85rem'},children:[]}]}]},
{name:'Navbar Dark',nodes:[{id:'nd',type:'section',tag:'nav',content:'',styles:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 32px',background:'#0f172a'},children:[{id:'nd1',type:'text',tag:'span',content:'OmniBuilder',styles:{fontWeight:'800',fontSize:'1.1rem',color:'#fff'},children:[]},{id:'nd2',type:'container',tag:'div',content:'',styles:{display:'flex',gap:'24px'},children:[{id:'nd2a',type:'text',tag:'a',content:'Features',styles:{color:'rgba(255,255,255,0.7)',fontSize:'0.9rem'},children:[]},{id:'nd2b',type:'text',tag:'a',content:'Pricing',styles:{color:'rgba(255,255,255,0.7)',fontSize:'0.9rem'},children:[]}]},{id:'nd3',type:'button',tag:'button',content:'Sign Up',styles:{background:'#7c3aed',color:'#fff',padding:'8px 16px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]}]},
],
'Features':[
{name:'Features 3 Col',nodes:[{id:'f3',type:'section',tag:'section',content:'',styles:{padding:'64px 32px'},children:[{id:'f3h',type:'heading',tag:'h2',content:'Why Choose Us',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'40px'},children:[]},{id:'f3g',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',maxWidth:'1000px',margin:'0 auto'},children:[{id:'f3c1',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb',textAlign:'center'},children:[{id:'f3c1h',type:'heading',tag:'h3',content:'Fast',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'f3c1p',type:'text',tag:'p',content:'Sub-second load times.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'f3c2',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb',textAlign:'center'},children:[{id:'f3c2h',type:'heading',tag:'h3',content:'Responsive',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'f3c2p',type:'text',tag:'p',content:'Perfect on every screen.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'f3c3',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb',textAlign:'center'},children:[{id:'f3c3h',type:'heading',tag:'h3',content:'SEO Ready',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'f3c3p',type:'text',tag:'p',content:'Built-in SEO tools.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]}]}]}]},
],
'Pricing':[
{name:'Pricing 3 Tier',nodes:[{id:'p3',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',textAlign:'center'},children:[{id:'p3h',type:'heading',tag:'h2',content:'Pricing',styles:{fontSize:'2rem',fontWeight:'800',marginBottom:'40px'},children:[]},{id:'p3g',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',maxWidth:'900px',margin:'0 auto'},children:[{id:'p3c1',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb'},children:[{id:'p3c1n',type:'text',tag:'p',content:'Starter',styles:{fontWeight:'600',marginBottom:'8px'},children:[]},{id:'p3c1p',type:'heading',tag:'h3',content:'$9/mo',styles:{fontSize:'2.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'p3c1b',type:'button',tag:'button',content:'Choose',styles:{width:'100%',background:'#f3f4f6',color:'#374151',padding:'12px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]},{id:'p3c2',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'2px solid #7c3aed',background:'#faf5ff'},children:[{id:'p3c2n',type:'text',tag:'p',content:'Pro',styles:{fontWeight:'600',color:'#7c3aed',marginBottom:'8px'},children:[]},{id:'p3c2p',type:'heading',tag:'h3',content:'$29/mo',styles:{fontSize:'2.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'p3c2b',type:'button',tag:'button',content:'Choose',styles:{width:'100%',background:'#7c3aed',color:'#fff',padding:'12px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]},{id:'p3c3',type:'container',tag:'div',content:'',styles:{padding:'32px',borderRadius:'16px',border:'1px solid #e5e7eb'},children:[{id:'p3c3n',type:'text',tag:'p',content:'Enterprise',styles:{fontWeight:'600',marginBottom:'8px'},children:[]},{id:'p3c3p',type:'heading',tag:'h3',content:'$99/mo',styles:{fontSize:'2.5rem',fontWeight:'800',marginBottom:'16px'},children:[]},{id:'p3c3b',type:'button',tag:'button',content:'Contact',styles:{width:'100%',background:'#f3f4f6',color:'#374151',padding:'12px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]}]}]}]},
],
'Testimonials':[
{name:'Testimonials Grid',nodes:[{id:'tg',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',background:'#f9fafb'},children:[{id:'tgh',type:'heading',tag:'h2',content:'What Customers Say',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'40px'},children:[]},{id:'tgg',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',maxWidth:'1000px',margin:'0 auto'},children:[{id:'tg1',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',background:'#fff',border:'1px solid #e5e7eb'},children:[{id:'tg1q',type:'text',tag:'p',content:'Incredible tool. Saved us weeks.',styles:{color:'#374151',marginBottom:'16px',fontStyle:'italic'},children:[]},{id:'tg1a',type:'text',tag:'p',content:'Sarah J., CEO',styles:{fontWeight:'600',fontSize:'0.85rem'},children:[]}]},{id:'tg2',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',background:'#fff',border:'1px solid #e5e7eb'},children:[{id:'tg2q',type:'text',tag:'p',content:'Best builder we have used.',styles:{color:'#374151',marginBottom:'16px',fontStyle:'italic'},children:[]},{id:'tg2a',type:'text',tag:'p',content:'Mike C., CTO',styles:{fontWeight:'600',fontSize:'0.85rem'},children:[]}]},{id:'tg3',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',background:'#fff',border:'1px solid #e5e7eb'},children:[{id:'tg3q',type:'text',tag:'p',content:'Revolutionary product.',styles:{color:'#374151',marginBottom:'16px',fontStyle:'italic'},children:[]},{id:'tg3a',type:'text',tag:'p',content:'Emma D., Designer',styles:{fontWeight:'600',fontSize:'0.85rem'},children:[]}]}]}]}]},
],
'Footer':[
{name:'Footer 4 Col',nodes:[{id:'ft',type:'section',tag:'footer',content:'',styles:{padding:'48px 32px',background:'#0f172a',color:'#fff'},children:[{id:'ftg',type:'container',tag:'div',content:'',styles:{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'40px',maxWidth:'1000px',margin:'0 auto'},children:[{id:'ft1',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft1a',type:'text',tag:'span',content:'OmniBuilder',styles:{fontWeight:'800',fontSize:'1.2rem'},children:[]},{id:'ft1b',type:'text',tag:'p',content:'Building the future.',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',marginTop:'8px'},children:[]}]},{id:'ft2',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft2h',type:'text',tag:'p',content:'Product',styles:{fontWeight:'700',fontSize:'0.85rem',marginBottom:'12px'},children:[]},{id:'ft2a',type:'text',tag:'a',content:'Features',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]},{id:'ft2b',type:'text',tag:'a',content:'Pricing',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block'},children:[]}]},{id:'ft3',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft3h',type:'text',tag:'p',content:'Company',styles:{fontWeight:'700',fontSize:'0.85rem',marginBottom:'12px'},children:[]},{id:'ft3a',type:'text',tag:'a',content:'About',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]},{id:'ft3b',type:'text',tag:'a',content:'Blog',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block'},children:[]}]},{id:'ft4',type:'container',tag:'div',content:'',styles:{},children:[{id:'ft4h',type:'text',tag:'p',content:'Legal',styles:{fontWeight:'700',fontSize:'0.85rem',marginBottom:'12px'},children:[]},{id:'ft4a',type:'text',tag:'a',content:'Privacy',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block',marginBottom:'8px'},children:[]},{id:'ft4b',type:'text',tag:'a',content:'Terms',styles:{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',display:'block'},children:[]}]}]}]}]},
],
'CTA':[
{name:'CTA Banner',nodes:[{id:'cta',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',borderRadius:'24px',margin:'32px',textAlign:'center'},children:[{id:'ctah',type:'heading',tag:'h2',content:'Ready to Start?',styles:{fontSize:'2.2rem',fontWeight:'800',color:'#fff',marginBottom:'12px'},children:[]},{id:'ctap',type:'text',tag:'p',content:'Join thousands building with OmniBuilder.',styles:{color:'rgba(255,255,255,0.8)',marginBottom:'24px'},children:[]},{id:'ctab',type:'button',tag:'button',content:'Start Free Trial',styles:{background:'#fff',color:'#7c3aed',padding:'14px 32px',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]}]},
],
'FAQ':[
{name:'FAQ List',nodes:[{id:'faq',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',maxWidth:'700px',margin:'0 auto'},children:[{id:'faqh',type:'heading',tag:'h2',content:'FAQ',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'40px'},children:[]},{id:'faq1',type:'container',tag:'div',content:'',styles:{padding:'20px',borderBottom:'1px solid #e5e7eb'},children:[{id:'faq1q',type:'heading',tag:'h3',content:'How does it work?',styles:{fontSize:'1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'faq1a',type:'text',tag:'p',content:'Visual drag-and-drop. No code needed.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]},{id:'faq2',type:'container',tag:'div',content:'',styles:{padding:'20px',borderBottom:'1px solid #e5e7eb'},children:[{id:'faq2q',type:'heading',tag:'h3',content:'Can I import sites?',styles:{fontSize:'1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'faq2a',type:'text',tag:'p',content:'Yes. ZIP, Git, URL, or HTML upload.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]}]}]},
],
'Contact':[
{name:'Contact Section',nodes:[{id:'cs',type:'section',tag:'section',content:'',styles:{padding:'64px 32px',maxWidth:'600px',margin:'0 auto'},children:[{id:'csh',type:'heading',tag:'h2',content:'Get in Touch',styles:{fontSize:'2rem',fontWeight:'800',textAlign:'center',marginBottom:'32px'},children:[]},{id:'csf',type:'container',tag:'div',content:'',styles:{display:'grid',gap:'16px'},children:[{id:'csf1',type:'container',tag:'div',content:'',styles:{height:'48px',borderRadius:'10px',border:'1px solid #e5e7eb',background:'#f9fafb'},children:[]},{id:'csf2',type:'container',tag:'div',content:'',styles:{height:'48px',borderRadius:'10px',border:'1px solid #e5e7eb',background:'#f9fafb'},children:[]},{id:'csf3',type:'container',tag:'div',content:'',styles:{height:'120px',borderRadius:'10px',border:'1px solid #e5e7eb',background:'#f9fafb'},children:[]},{id:'csf4',type:'button',tag:'button',content:'Send Message',styles:{height:'48px',background:'#7c3aed',color:'#fff',borderRadius:'10px',fontWeight:'700',border:'none'},children:[]}]}]}]},
],
'Layout':[
{name:'2 Column',nodes:[{id:'l2',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',padding:'32px'},children:[{id:'l2a',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'200px'},children:[]},{id:'l2b',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'200px'},children:[]}]}]},
{name:'3 Column',nodes:[{id:'l3',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',padding:'32px'},children:[{id:'l3a',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'150px'},children:[]},{id:'l3b',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'150px'},children:[]},{id:'l3c',type:'container',tag:'div',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px',minHeight:'150px'},children:[]}]}]},
{name:'4 Column',nodes:[{id:'l4',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',padding:'32px'},children:[{id:'l4a',type:'container',tag:'div',content:'',styles:{padding:'16px',background:'#f9fafb',borderRadius:'8px',minHeight:'120px'},children:[]},{id:'l4b',type:'container',tag:'div',content:'',styles:{padding:'16px',background:'#f9fafb',borderRadius:'8px',minHeight:'120px'},children:[]},{id:'l4c',type:'container',tag:'div',content:'',styles:{padding:'16px',background:'#f9fafb',borderRadius:'8px',minHeight:'120px'},children:[]},{id:'l4d',type:'container',tag:'div',content:'',styles:{padding:'16px',background:'#f9fafb',borderRadius:'8px',minHeight:'120px'},children:[]}]}]},
{name:'Sidebar Left',nodes:[{id:'sl',type:'section',tag:'section',content:'',styles:{display:'grid',gridTemplateColumns:'250px 1fr',gap:'24px',padding:'32px'},children:[{id:'sla',type:'container',tag:'aside',content:'',styles:{padding:'24px',background:'#f9fafb',borderRadius:'12px'},children:[{id:'slat',type:'text',tag:'p',content:'Sidebar',styles:{fontWeight:'600'},children:[]}]},{id:'slb',type:'container',tag:'main',content:'',styles:{padding:'24px',border:'1px solid #e5e7eb',borderRadius:'12px',minHeight:'300px'},children:[]}]}]},
],
'Elements':[
{name:'Heading',nodes:[{id:'eh',type:'heading',tag:'h2',content:'New Heading',styles:{fontSize:'1.8rem',fontWeight:'700'},children:[]}]},
{name:'Paragraph',nodes:[{id:'ep',type:'text',tag:'p',content:'Your text here. Click to edit.',styles:{color:'#374151',lineHeight:'1.6'},children:[]}]},
{name:'Button',nodes:[{id:'eb',type:'button',tag:'button',content:'Click Me',styles:{background:'#7c3aed',color:'#fff',padding:'12px 24px',borderRadius:'8px',fontWeight:'600',border:'none'},children:[]}]},
{name:'Image',nodes:[{id:'ei',type:'container',tag:'div',content:'',styles:{width:'100%',height:'200px',background:'#f3f4f6',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center'},children:[{id:'eit',type:'text',tag:'span',content:'[Image]',styles:{color:'#9ca3af'},children:[]}]}]},
{name:'Divider',nodes:[{id:'ed',type:'container',tag:'div',content:'',styles:{borderTop:'1px solid #e5e7eb',margin:'24px 0',height:'1px'},children:[]}]},
{name:'Spacer',nodes:[{id:'es',type:'container',tag:'div',content:'',styles:{height:'48px'},children:[]}]},
{name:'Container',nodes:[{id:'ec',type:'container',tag:'div',content:'',styles:{padding:'24px',border:'1px dashed #d1d5db',borderRadius:'12px',minHeight:'100px'},children:[]}]},
{name:'Section',nodes:[{id:'ese',type:'section',tag:'section',content:'',styles:{padding:'48px 32px'},children:[]}]},
{name:'Link',nodes:[{id:'el',type:'text',tag:'a',content:'Click here',styles:{color:'#7c3aed',fontWeight:'500',textDecoration:'underline'},children:[]}]},
{name:'List',nodes:[{id:'eli',type:'container',tag:'ul',content:'',styles:{paddingLeft:'20px'},children:[{id:'eli1',type:'text',tag:'li',content:'Item one',styles:{marginBottom:'8px'},children:[]},{id:'eli2',type:'text',tag:'li',content:'Item two',styles:{marginBottom:'8px'},children:[]},{id:'eli3',type:'text',tag:'li',content:'Item three',styles:{},children:[]}]}]},
{name:'Blockquote',nodes:[{id:'ebq',type:'text',tag:'blockquote',content:'This is a quote.',styles:{borderLeft:'4px solid #7c3aed',paddingLeft:'16px',fontStyle:'italic',color:'#4b5563'},children:[]}]},
{name:'Code Block',nodes:[{id:'ecb',type:'text',tag:'pre',content:'const x = 42;',styles:{background:'#1e293b',color:'#a5f3fc',padding:'16px',borderRadius:'8px',fontSize:'0.85rem',overflow:'auto'},children:[]}]},
{name:'Badge',nodes:[{id:'ebg',type:'text',tag:'span',content:'NEW',styles:{background:'#7c3aed',color:'#fff',padding:'4px 12px',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'700'},children:[]}]},
{name:'Card',nodes:[{id:'ecd',type:'container',tag:'div',content:'',styles:{padding:'24px',borderRadius:'16px',border:'1px solid #e5e7eb',background:'#fff'},children:[{id:'ecdh',type:'heading',tag:'h3',content:'Card Title',styles:{fontSize:'1.1rem',fontWeight:'700',marginBottom:'8px'},children:[]},{id:'ecdp',type:'text',tag:'p',content:'Card description text goes here.',styles:{color:'#6b7280',fontSize:'0.9rem'},children:[]}]}]},
{name:'Progress Bar',nodes:[{id:'epb',type:'container',tag:'div',content:'',styles:{height:'8px',background:'#e5e7eb',borderRadius:'4px',overflow:'hidden'},children:[{id:'epbf',type:'container',tag:'div',content:'',styles:{height:'100%',width:'65%',background:'#7c3aed',borderRadius:'4px'},children:[]}]}]},
{name:'Avatar',nodes:[{id:'eav',type:'container',tag:'div',content:'',styles:{width:'48px',height:'48px',borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700'},children:[{id:'eavt',type:'text',tag:'span',content:'JD',styles:{},children:[]}]}]},
],
};

const TEMPLATES: Record<string,string[]> = {
'SaaS Landing':['Navbar Light','Hero Centered','Features 3 Col','Pricing 3 Tier','Testimonials Grid','CTA Banner','Footer 4 Col'],
'Agency':['Navbar Light','Hero Split','Features 3 Col','Testimonials Grid','Contact Section','Footer 4 Col'],
'Portfolio':['Navbar Dark','Hero Minimal','Features 3 Col','CTA Banner','Footer 4 Col'],
'Business':['Navbar Light','Hero Centered','Features 3 Col','Pricing 3 Tier','FAQ List','Footer 4 Col'],
'Startup':['Navbar Dark','Hero Dark','Features 3 Col','Pricing 3 Tier','CTA Banner','Footer 4 Col'],
};

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
  const [tab, setTab] = useState<'components'|'elements'|'templates'>('components');
  const [hist, setHist] = useState<BNode[][]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [saved, setSaved] = useState(true);
  const [search, setSearch] = useState('');
  const [expCat, setExpCat] = useState<string|null>('Hero');
  const [ctxMenu, setCtxMenu] = useState<{x:number;y:number;id:string}|null>(null);

  useEffect(() => { const t = setTimeout(() => { localStorage.setItem('builder-nodes', JSON.stringify(nodes)); setSaved(true); }, 600); return () => clearTimeout(t); }, [nodes]);

  const push = (n: BNode[]) => { const h = hist.slice(0, hIdx+1); h.push(JSON.parse(JSON.stringify(n))); setHist(h); setHIdx(h.length-1); };
  const up = (n: BNode[]) => { setNodes(n); push(n); setSaved(false); };
  const undo = () => { if(hIdx>0){setHIdx(hIdx-1);setNodes(hist[hIdx-1]);} };
  const redo = () => { if(hIdx<hist.length-1){setHIdx(hIdx+1);setNodes(hist[hIdx+1]);} };

  const find = (ns: BNode[], id: string): BNode|null => { for(const n of ns){if(n.id===id)return n;const f=find(n.children,id);if(f)return f;} return null; };
  const upd = (ns: BNode[], id: string, fn: (n:BNode)=>BNode): BNode[] => ns.map(n => n.id===id ? fn(n) : {...n, children: upd(n.children,id,fn)});
  const del = (ns: BNode[], id: string): BNode[] => ns.filter(n=>n.id!==id).map(n=>({...n,children:del(n.children,id)}));
  const clone = (n: BNode): BNode => ({...n, id:'n'+Date.now()+Math.random().toString(36).slice(2,5), children:n.children.map(clone)});

  const sel = selId ? find(nodes, selId) : null;

  const addComp = (cn: BNode[]) => up([...nodes, ...cn.map(clone)]);
  const applyTpl = (name: string) => {
    const names = TEMPLATES[name]; if(!names) return;
    const all: BNode[] = [];
    for(const n of names){ for(const cat of Object.values(CATS)){ const c=cat.find(x=>x.name===n); if(c){all.push(...c.nodes.map(clone));break;} } }
    up(all);
  };

  const moveUp = (id: string) => { const i = nodes.findIndex(n=>n.id===id); if(i>0){const a=[...nodes];[a[i-1],a[i]]=[a[i],a[i-1]];up(a);} };
  const moveDown = (id: string) => { const i = nodes.findIndex(n=>n.id===id); if(i<nodes.length-1){const a=[...nodes];[a[i],a[i+1]]=[a[i+1],a[i]];up(a);} };
  const doDelete = () => { if(!selId) return; up(del(nodes,selId)); setSelId(null); };
  const doDuplicate = () => { if(!selId) return; const n=find(nodes,selId); if(n)up([...nodes,clone(n)]); };
  const doLock = () => { if(!selId) return; up(upd(nodes,selId,n=>({...n,locked:!n.locked}))); };
  const doHide = () => { if(!selId) return; up(upd(nodes,selId,n=>({...n,hidden:!n.hidden}))); };
  const doWrap = () => { if(!selId) return; const n=find(nodes,selId); if(!n)return; const wrapper:BNode={id:'w'+Date.now(),type:'container',tag:'div',content:'',styles:{padding:'16px',border:'1px dashed #d1d5db',borderRadius:'8px'},children:[{...n}]}; up(del(nodes,selId).concat([wrapper])); setSelId(wrapper.id); };

  const styl = (p:string,v:string) => { if(!selId) return; up(upd(nodes,selId,n=>({...n,styles:{...n.styles,[p]:v}}))); };
  const cont = (v:string) => { if(!selId) return; up(upd(nodes,selId,n=>({...n,content:v}))); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if((e.target as HTMLElement).isContentEditable) return;
      if((e.metaKey||e.ctrlKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo();}
      if((e.metaKey||e.ctrlKey)&&e.key==='d'){e.preventDefault();doDuplicate();}
      if((e.metaKey||e.ctrlKey)&&e.key==='c'&&selId){localStorage.setItem('builder-clipboard',JSON.stringify(find(nodes,selId)));}
      if((e.metaKey||e.ctrlKey)&&e.key==='v'){const c=localStorage.getItem('builder-clipboard');if(c){try{up([...nodes,clone(JSON.parse(c))]);}catch{}}}
      if(e.key==='Delete'||e.key==='Backspace'){if(selId)doDelete();}
      if(e.key==='Escape'){setSelId(null);setCtxMenu(null);}
    };
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  });

  const renderNode = (node: BNode): React.ReactNode => {
    if(node.hidden) return <div key={node.id} style={{opacity:0.3,padding:'8px',border:'1px dashed #d1d5db',borderRadius:'4px',fontSize:'11px',color:'#9ca3af'}}>(Hidden: {node.type})</div>;
    const isSel = selId===node.id;
    const style: React.CSSProperties = {...(node.styles as any), cursor:node.locked?'not-allowed':'pointer', outline:isSel?'2px solid #7c3aed':undefined, outlineOffset:'2px', position:'relative' as const, minHeight:!node.content&&node.children.length===0?'40px':undefined};
    return (
      <div key={node.id} style={style} onClick={e=>{e.stopPropagation();if(!node.locked)setSelId(node.id);}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setSelId(node.id);setCtxMenu({x:e.clientX,y:e.clientY,id:node.id});}}>
        {isSel && (
          <div style={{position:'absolute',top:'-32px',left:'0',display:'flex',gap:'2px',zIndex:50,background:'#fff',border:'1px solid #e5e7eb',borderRadius:'6px',padding:'2px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}} onClick={e=>e.stopPropagation()}>
            <button onClick={doDuplicate} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:'#f3f4f6',cursor:'pointer'}}>Dup</button>
            <button onClick={doDelete} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:'#fef2f2',color:'#dc2626',cursor:'pointer'}}>Del</button>
            <button onClick={()=>moveUp(node.id)} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:'#f3f4f6',cursor:'pointer'}}>Up</button>
            <button onClick={()=>moveDown(node.id)} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:'#f3f4f6',cursor:'pointer'}}>Dn</button>
            <button onClick={doLock} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:node.locked?'#fef3c7':'#f3f4f6',cursor:'pointer'}}>{node.locked?'Unlock':'Lock'}</button>
            <button onClick={doHide} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:'#f3f4f6',cursor:'pointer'}}>Hide</button>
            <button onClick={doWrap} style={{padding:'4px 6px',fontSize:'10px',borderRadius:'4px',border:'none',background:'#f3f4f6',cursor:'pointer'}}>Wrap</button>
          </div>
        )}
        {node.content && <span contentEditable={!node.locked} suppressContentEditableWarning onBlur={e=>{if(!node.locked){const c=e.currentTarget.textContent||'';setNodes(p=>upd(p,node.id,n=>({...n,content:c})));setSaved(false);}}}>{node.content}</span>}
        {node.children.map(renderNode)}
      </div>
    );
  };

  const renderLayer = (node: BNode, depth: number): React.ReactNode => (
    <div key={node.id}>
      <div onClick={()=>setSelId(node.id)} onContextMenu={e=>{e.preventDefault();setSelId(node.id);setCtxMenu({x:e.clientX,y:e.clientY,id:node.id});}} style={{paddingLeft:depth*12+4+'px'}} className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer text-[10px] ${selId===node.id?'bg-purple-100 text-purple-700':'text-gray-600 hover:bg-gray-50'} ${node.hidden?'opacity-40':''} ${node.locked?'italic':''}`}>
        <span className="text-gray-300">{node.children.length>0?'v':'.'}</span>
        <span className="flex-1 truncate">{node.name||node.type}{node.content?': '+node.content.slice(0,12):''}</span>
        {node.locked&&<span className="text-[8px] text-orange-400">L</span>}
        {node.hidden&&<span className="text-[8px] text-gray-400">H</span>}
      </div>
      {node.children.map(c=>renderLayer(c, depth+1))}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-sm" onClick={()=>setCtxMenu(null)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 h-10 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-purple-600 font-medium text-xs">Back</Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">Visual Builder</span>
        </div>
        <div className="flex items-center gap-1">
          {(['desktop','tablet','mobile'] as const).map(b=>(<button key={b} onClick={()=>setBp(b)} className={`w-7 h-7 rounded text-[10px] ${bp===b?'bg-purple-600 text-white':'bg-gray-100 text-gray-600'}`}>{b[0].toUpperCase()}</button>))}
          <span className="w-px h-4 bg-gray-200 mx-1"/>
          <button onClick={undo} className="w-7 h-7 rounded bg-gray-100 text-[10px] hover:bg-gray-200" title="Undo (Ctrl+Z)">U</button>
          <button onClick={redo} className="w-7 h-7 rounded bg-gray-100 text-[10px] hover:bg-gray-200" title="Redo">R</button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${saved?'text-green-600':'text-orange-500'}`}>{saved?'Saved':'Unsaved'}</span>
          <button className="h-7 px-2.5 rounded bg-gray-100 text-[10px] font-semibold">Preview</button>
          <button className="h-7 px-2.5 rounded bg-purple-600 text-white text-[10px] font-semibold">Publish</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[240px_1fr_240px] overflow-hidden">
        {/* LEFT */}
        <div className="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['components','elements','templates'] as const).map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex-1 py-1.5 text-[10px] font-semibold capitalize ${tab===t?'text-purple-700 border-b-2 border-purple-600':'text-gray-500'}`}>{t}</button>))}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {tab==='components'&&(<div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full h-6 rounded border border-gray-200 px-2 text-[10px] mb-2 focus:border-purple-500 focus:outline-none"/>
              {Object.entries(CATS).filter(([c])=>c!=='Elements'&&(!search||c.toLowerCase().includes(search.toLowerCase()))).map(([cat,comps])=>(<div key={cat} className="mb-1"><button onClick={()=>setExpCat(expCat===cat?null:cat)} className="w-full flex justify-between items-center px-2 py-1 rounded text-[10px] font-semibold text-gray-700 hover:bg-gray-50">{cat}<span className="text-gray-400">{comps.length}</span></button>{expCat===cat&&<div className="pl-2">{comps.map(c=>(<button key={c.name} onClick={()=>addComp(c.nodes)} className="w-full text-left px-2 py-1 rounded text-[10px] text-gray-600 hover:bg-purple-50 hover:text-purple-700">{c.name}</button>))}</div>}</div>))}
            </div>)}
            {tab==='elements'&&(<div className="space-y-0.5">{CATS['Elements'].map(el=>(<button key={el.name} onClick={()=>addComp(el.nodes)} className="w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"><span className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[8px]">+</span>{el.name}</button>))}</div>)}
            {tab==='templates'&&(<div className="space-y-1.5"><p className="text-[9px] text-gray-400 px-1">Click to apply full page</p>{Object.keys(TEMPLATES).map(n=>(<button key={n} onClick={()=>{if(nodes.length>0&&!confirm('Replace current?'))return;applyTpl(n);}} className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50"><div className="text-[10px] font-semibold text-gray-800">{n}</div><div className="text-[9px] text-gray-400">{TEMPLATES[n].length} sections</div></button>))}</div>)}
          </div>
        </div>

        {/* CANVAS - scrollable */}
        <div className="overflow-y-auto p-4 flex flex-col items-center" onClick={()=>setSelId(null)}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible transition-all ${bp==='desktop'?'w-full max-w-[1200px]':bp==='tablet'?'w-[768px]':'w-[375px]'}`} style={{minHeight:'100%'}}>
            {nodes.length>0?nodes.map(renderNode):(<div className="flex flex-col items-center justify-center h-80 text-gray-400"><p className="text-sm font-medium">Start building</p><p className="text-xs mt-1">Add components or apply a template</p></div>)}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Properties</h4>
            {sel?(<div className="space-y-2">
              <div className="text-[9px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{sel.name||sel.type} - {sel.tag}</div>
              {sel.content!==undefined&&<div><label className="block text-[8px] font-semibold text-gray-500 uppercase mb-0.5">Content</label><textarea value={sel.content} onChange={e=>cont(e.target.value)} className="w-full h-12 rounded border border-gray-200 p-1 text-[10px] resize-none focus:border-purple-500 focus:outline-none"/></div>}
              {[['fontSize','Font Size'],['fontWeight','Weight'],['color','Color'],['background','Background'],['padding','Padding'],['margin','Margin'],['borderRadius','Radius'],['display','Display'],['gap','Gap'],['width','Width'],['height','Height'],['maxWidth','Max Width'],['opacity','Opacity'],['border','Border'],['boxShadow','Shadow']].map(([k,l])=>(<div key={k}><label className="block text-[8px] font-semibold text-gray-500 uppercase mb-0.5">{l}</label><input value={(sel.styles as any)[k]||''} onChange={e=>styl(k,e.target.value)} className="w-full h-5 rounded border border-gray-200 px-1 text-[10px] focus:border-purple-500 focus:outline-none"/></div>))}
              <div><label className="block text-[8px] font-semibold text-gray-500 uppercase mb-0.5">Text Align</label><div className="flex gap-0.5">{['left','center','right'].map(a=>(<button key={a} onClick={()=>styl('textAlign',a)} className={`flex-1 h-5 rounded border text-[8px] font-bold ${sel.styles.textAlign===a?'border-purple-500 bg-purple-50 text-purple-600':'border-gray-200'}`}>{a[0].toUpperCase()}</button>))}</div></div>
              <div className="pt-1.5 border-t border-gray-100 grid grid-cols-2 gap-1">
                <button onClick={doDuplicate} className="h-5 rounded border border-gray-200 text-[9px] font-semibold hover:bg-gray-50">Duplicate</button>
                <button onClick={doDelete} className="h-5 rounded border border-red-200 text-[9px] text-red-600 hover:bg-red-50">Delete</button>
                <button onClick={doLock} className="h-5 rounded border border-gray-200 text-[9px] hover:bg-gray-50">{sel.locked?'Unlock':'Lock'}</button>
                <button onClick={doHide} className="h-5 rounded border border-gray-200 text-[9px] hover:bg-gray-50">{sel.hidden?'Show':'Hide'}</button>
                <button onClick={doWrap} className="h-5 rounded border border-gray-200 text-[9px] hover:bg-gray-50">Wrap</button>
                <button onClick={()=>{if(selId)moveUp(selId)}} className="h-5 rounded border border-gray-200 text-[9px] hover:bg-gray-50">Move Up</button>
              </div>
            </div>):(<p className="text-[10px] text-gray-400">Select an element to edit</p>)}
          </div>
          {/* Layers */}
          <div className="border-t border-gray-200 h-[200px] overflow-y-auto p-2">
            <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Layers</h4>
            {nodes.map(n=>renderLayer(n,0))}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {ctxMenu&&(<div style={{position:'fixed',top:ctxMenu.y,left:ctxMenu.x,zIndex:9999}} className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]" onClick={e=>e.stopPropagation()}>
        <button onClick={()=>{doDuplicate();setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Duplicate</button>
        <button onClick={()=>{doDelete();setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50">Delete</button>
        <button onClick={()=>{if(selId)moveUp(selId);setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Move Up</button>
        <button onClick={()=>{if(selId)moveDown(selId);setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Move Down</button>
        <button onClick={()=>{doLock();setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">{sel?.locked?'Unlock':'Lock'}</button>
        <button onClick={()=>{doHide();setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">{sel?.hidden?'Show':'Hide'}</button>
        <button onClick={()=>{doWrap();setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Wrap in Container</button>
        <button onClick={()=>{if(selId){localStorage.setItem('builder-clipboard',JSON.stringify(find(nodes,selId)));}setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Copy</button>
        <button onClick={()=>{const c=localStorage.getItem('builder-clipboard');if(c){try{up([...nodes,clone(JSON.parse(c))]);}catch{}}setCtxMenu(null);}} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50">Paste</button>
      </div>)}
    </div>
  );
}
