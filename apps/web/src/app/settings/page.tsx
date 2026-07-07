'use client';

import { useState, useEffect } from 'react';

interface Settings { siteName: string; tagline: string; siteEmail: string; siteUrl: string; timezone: string; language: string; theme: string; primaryColor: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ siteName: 'TechCorp Website', tagline: 'We build amazing digital experiences', siteEmail: 'info@techcorp.com', siteUrl: 'https://techcorp.com', timezone: '(UTC+05:30) IST', language: 'English (US)', theme: 'default', primaryColor: '#7c3aed' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'general'|'seo'|'theme'|'branding'>('general');

  useEffect(() => {
    const s = localStorage.getItem('omnibuilder-settings');
    if (s) try { setSettings(JSON.parse(s)); } catch {}
  }, []);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem('omnibuilder-settings', JSON.stringify(settings));
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 300);
  };

  const update = (key: keyof Settings, value: string) => setSettings({ ...settings, [key]: value });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600 font-medium">\u2713 Saved</span>}
          <button onClick={handleSave} disabled={saving} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['general','seo','theme','branding'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-all ${tab === t ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {tab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Site Title</label><input value={settings.siteName} onChange={e => update('siteName', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Tagline</label><input value={settings.tagline} onChange={e => update('tagline', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Site Email</label><input value={settings.siteEmail} onChange={e => update('siteEmail', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Site URL</label><input value={settings.siteUrl} onChange={e => update('siteUrl', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Timezone</label><select value={settings.timezone} onChange={e => update('timezone', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"><option>(UTC+05:30) IST</option><option>(UTC+00:00) GMT</option><option>(UTC-05:00) EST</option><option>(UTC-08:00) PST</option></select></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Language</label><select value={settings.language} onChange={e => update('language', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"><option>English (US)</option><option>Hindi</option><option>Spanish</option></select></div>
          </div>
        )}
        {tab === 'seo' && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Default Meta Title</label><input defaultValue={settings.siteName} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Default Meta Description</label><textarea defaultValue={settings.tagline} className="w-full h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Robots.txt</label><textarea defaultValue="User-agent: *\nAllow: /" className="w-full h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono resize-none focus:border-purple-500 focus:outline-none" /></div>
          </div>
        )}
        {tab === 'theme' && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Primary Color</label><div className="flex gap-2"><input type="color" value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" /><input value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="h-10 w-32 rounded-lg border border-gray-200 px-3 text-sm" /></div></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Theme</label><select value={settings.theme} onChange={e => update('theme', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"><option value="default">Default</option><option value="dark">Dark</option><option value="minimal">Minimal</option></select></div>
          </div>
        )}
        {tab === 'branding' && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Logo URL</label><input placeholder="https://yoursite.com/logo.png" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1">Favicon URL</label><input placeholder="https://yoursite.com/favicon.ico" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
