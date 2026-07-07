'use client';
export default function MenusPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menus</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">Menu Structure</h3>
          {['Home','About','Services','Portfolio','Blog','Contact'].map(item => (<div key={item} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg mb-2 cursor-grab"><span className="text-gray-400">☰</span><span className="text-sm font-medium">{item}</span></div>))}
          <button className="mt-3 h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">Save Menu</button>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">Menu Locations</h3>
          <div className="space-y-3">
            <div><label className="block text-sm text-gray-600 mb-1">Primary Navigation</label><select className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"><option>Main Menu</option></select></div>
            <div><label className="block text-sm text-gray-600 mb-1">Footer Navigation</label><select className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm"><option>Footer Menu</option></select></div>
          </div>
        </div>
      </div>
    </div>
  );
}
