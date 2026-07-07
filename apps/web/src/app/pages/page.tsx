'use client';
import Link from 'next/link';

const pages = ['Home','About Us','Services','Portfolio','Blog','Contact Us','Pricing','FAQs','Testimonials','Team','Gallery','Shop','Product Details','Cart','Checkout','My Account','Terms & Conditions','Privacy Policy'];

export default function PagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pages</h1><p className="text-gray-500 text-sm">Manage and edit your website pages</p></div>
        <button className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-semibold">+ Create New Page</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>{pages.map((p,i) => (<tr key={p} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-4 py-3 font-medium text-sm text-gray-900">{p}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Published</span></td><td className="px-4 py-3 text-sm text-gray-500">Jul {7-i%7}, 2026</td><td className="px-4 py-3"><Link href="/visual-builder" className="text-xs text-purple-600 font-semibold">Edit</Link></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
