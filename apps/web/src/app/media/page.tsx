'use client';
export default function MediaPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Media Library</h1><p className="text-gray-500 text-sm">Upload and manage your media files</p></div>
        <button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Upload Files</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({length:24}).map((_,i) => (
            <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:shadow-md transition-all cursor-pointer">
              {['IMG','PNG','SVG','MP4','PDF'][i%5]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
