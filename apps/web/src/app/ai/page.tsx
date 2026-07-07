'use client';

import { useState } from 'react';

interface Message { role: 'user' | 'ai'; content: string; timestamp: string; }

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response (in production: call /api/v1/ai/prompt)
    setTimeout(() => {
      let response = '';
      const prompt = userMsg.content.toLowerCase();

      if (prompt.includes('hero') || prompt.includes('landing')) {
        response = 'I\'ve generated a hero section with a headline, subtitle, and CTA button. You can drag it into the visual builder from the Components panel.';
        setGeneratedCode('<section style="padding:64px 32px;text-align:center"><h1 style="font-size:3rem;font-weight:800">Your Amazing Product</h1><p style="color:#6b7280;margin:16px auto;max-width:600px">Build something extraordinary with our platform.</p><button style="background:#7c3aed;color:white;padding:14px 32px;border-radius:12px;border:none;font-weight:700">Get Started</button></section>');
      } else if (prompt.includes('form') || prompt.includes('contact')) {
        response = 'I\'ve created a contact form with name, email, and message fields. The form is connected to your Forms module for submission handling.';
        setGeneratedCode('<form style="max-width:500px;margin:0 auto;padding:32px"><h2 style="font-weight:700;margin-bottom:16px">Contact Us</h2><input placeholder="Name" style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px" /><input placeholder="Email" style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px" /><textarea placeholder="Message" style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;height:100px"></textarea><button style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;border:none;font-weight:700">Send</button></form>');
      } else if (prompt.includes('pricing') || prompt.includes('plan')) {
        response = 'Generated a 3-tier pricing table. You can customize the prices and features in the visual builder.';
        setGeneratedCode('<section style="padding:48px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div style="padding:32px;border:1px solid #e5e7eb;border-radius:16px;text-align:center"><h3>Starter</h3><p style="font-size:2rem;font-weight:800">$9/mo</p></div><div style="padding:32px;border:2px solid #7c3aed;border-radius:16px;text-align:center"><h3>Pro</h3><p style="font-size:2rem;font-weight:800">$29/mo</p></div><div style="padding:32px;border:1px solid #e5e7eb;border-radius:16px;text-align:center"><h3>Enterprise</h3><p style="font-size:2rem;font-weight:800">$99/mo</p></div></section>');
      } else {
        response = `I understand you want: "${userMsg.content}". I can generate page sections, forms, navigation, hero areas, pricing tables, and more. Try asking for specific components like "Generate a hero section" or "Create a contact form".`;
      }

      setMessages(prev => [...prev, { role: 'ai', content: response, timestamp: new Date().toISOString() }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Builder</h1>
      <p className="text-gray-500 text-sm mb-6">Generate pages, sections, and components with AI</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
        {/* Chat */}
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && <div className="text-center text-gray-400 py-12"><p className="text-lg mb-2">\uD83E\uDD16</p><p className="text-sm">Ask me to generate page sections, components, or entire pages.</p><p className="text-xs mt-2">Try: &quot;Generate a hero section for a SaaS product&quot;</p></div>}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.content}</div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-gray-100 px-4 py-2.5 rounded-2xl text-sm text-gray-500">Generating...</div></div>}
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendPrompt()} placeholder="Describe what you want to build..." className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
              <button onClick={sendPrompt} disabled={loading || !input.trim()} className="h-10 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">Send</button>
            </div>
          </div>
        </div>

        {/* Generated Code Preview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">Generated Output</h3>
          {generatedCode ? (
            <>
              <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50 overflow-hidden" dangerouslySetInnerHTML={{ __html: generatedCode }} />
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto mb-3">
                <pre className="text-xs text-green-400 whitespace-pre-wrap">{generatedCode}</pre>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(generatedCode); }} className="flex-1 h-8 rounded-lg bg-gray-100 text-xs font-semibold">Copy Code</button>
                <button className="flex-1 h-8 rounded-lg bg-purple-600 text-white text-xs font-semibold">Add to Builder</button>
              </div>
            </>
          ) : <p className="text-sm text-gray-400">Generated components will appear here</p>}
        </div>
      </div>
    </div>
  );
}
