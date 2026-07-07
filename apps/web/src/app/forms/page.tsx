'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface FormItem { id: string; name: string; schema: any; settings?: any; _count?: { submissions: number }; }
interface Submission { id: string; data: any; createdAt: string; }

export default function FormsPage() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Array<{ name: string; type: string; required: boolean }>>([{ name: 'Name', type: 'text', required: true }, { name: 'Email', type: 'email', required: true }, { name: 'Message', type: 'textarea', required: false }]);
  const [creating, setCreating] = useState(false);
  const [viewSubs, setViewSubs] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadForms = async () => {
    setLoading(true);
    try { setForms(await api.getForms()); } catch { setForms([]); }
    setLoading(false);
  };

  useEffect(() => { loadForms(); }, []);

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setCreating(true);
    try {
      const projectId = localStorage.getItem('currentProjectId') || undefined;
      await api.createForm({ name: formName, schema: { fields }, projectId });
      setFormName(''); setFields([{ name: '', type: 'text', required: false }]); setShowCreate(false);
      await loadForms();
    } catch (e: any) { alert(e.message); }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete form and all submissions?')) return;
    try { await api.deleteForm(id); await loadForms(); } catch {};
  };

  const loadSubmissions = async (formId: string) => {
    setViewSubs(formId);
    try { setSubmissions(await api.getFormSubmissions(formId)); } catch { setSubmissions([]); }
  };

  const addField = () => setFields([...fields, { name: '', type: 'text', required: false }]);
  const updateField = (i: number, key: string, val: any) => { const f = [...fields]; (f[i] as any)[key] = val; setFields(f); };
  const removeField = (i: number) => setFields(fields.filter((_, idx) => idx !== i));

  const exportCSV = () => {
    if (submissions.length === 0) return;
    const keys = Object.keys(submissions[0].data);
    const csv = [keys.join(','), ...submissions.map(s => keys.map(k => `"${(s.data[k] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'submissions.csv'; a.click();
  };

  if (viewSubs) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div><button onClick={() => setViewSubs(null)} className="text-purple-600 text-sm font-medium">&larr; Back to Forms</button><h1 className="text-2xl font-bold text-gray-900 mt-2">Submissions</h1></div>
          <button onClick={exportCSV} disabled={submissions.length === 0} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">Export CSV</button>
        </div>
        {submissions.length === 0 ? <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">No submissions yet</div> : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full"><thead><tr className="border-b border-gray-100">{Object.keys(submissions[0].data).map(k => <th key={k} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{k}</th>)}<th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th></tr></thead>
            <tbody>{submissions.map(s => (<tr key={s.id} className="border-b border-gray-50">{Object.values(s.data).map((v, i) => <td key={i} className="px-4 py-3 text-sm">{String(v)}</td>)}<td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleString()}</td></tr>))}</tbody></table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Forms</h1><p className="text-gray-500 text-sm">Build forms and manage submissions</p></div>
        <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Create Form</button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Form Builder</h3>
          <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Form name" className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm mb-4 focus:border-purple-500 focus:outline-none" />
          <div className="space-y-2 mb-4">
            {fields.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={f.name} onChange={e => updateField(i, 'name', e.target.value)} placeholder="Field name" className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-purple-500 focus:outline-none" />
                <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)} className="h-9 rounded-lg border border-gray-200 px-2 text-sm"><option value="text">Text</option><option value="email">Email</option><option value="number">Number</option><option value="textarea">Textarea</option><option value="select">Select</option><option value="checkbox">Checkbox</option><option value="date">Date</option><option value="phone">Phone</option></select>
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} /> Req</label>
                <button onClick={() => removeField(i)} className="w-7 h-7 rounded border border-red-200 text-red-500 text-xs">&times;</button>
              </div>
            ))}
            <button onClick={addField} className="text-xs text-purple-600 font-semibold">+ Add Field</button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating} className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-50">{creating ? 'Creating...' : 'Create Form'}</button>
            <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-12 text-center text-gray-400">Loading...</div> : forms.length === 0 ? <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400">No forms yet</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map(f => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-1">{f.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{(f.schema as any)?.fields?.length || 0} fields, {f._count?.submissions || 0} submissions</p>
              <div className="flex gap-2">
                <button onClick={() => loadSubmissions(f.id)} className="flex-1 h-8 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">View Submissions</button>
                <button onClick={() => handleDelete(f.id)} className="h-8 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
