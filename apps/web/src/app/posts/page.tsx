'use client';
const posts = [{t:'10 Best Web Design Trends in 2026',s:'Published'},{t:'How to Improve Website Performance',s:'Published'},{t:'SEO Tips for Beginners',s:'Published'},{t:'Why Responsive Design Matters',s:'Draft'},{t:'Choosing the Right Web Framework',s:'Published'}];
export default function PostsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900">Posts / Blog</h1></div><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add New Post</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full"><thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th></tr></thead>
        <tbody>{posts.map(p => (<tr key={p.t} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm">{p.t}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.s==='Published'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{p.s}</span></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
