'use client';
const comps = ['Hero Section','Feature Box','Pricing Table','Team Member','Call To Action','FAQ Accordion','Testimonial','Counter','Footer','Navbar','Sidebar','Card Grid','Modal','Tabs','Carousel'];
export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900">Components</h1><p className="text-gray-500 text-sm">Reusable UI components</p></div><button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Add New</button></div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {comps.map(c => (<div key={c} className="p-4 rounded-xl border border-gray-200 text-center hover:border-purple-400 hover:-translate-y-0.5 transition-all cursor-pointer"><div className="w-10 h-10 rounded-lg bg-gray-100 mx-auto mb-2 flex items-center justify-center text-sm">⬡</div><div className="text-sm font-semibold">{c}</div></div>))}
        </div>
      </div>
    </div>
  );
}
