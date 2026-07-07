'use client';
const integrations = [{n:'Google Analytics',s:true},{n:'Google Search Console',s:true},{n:'Mailchimp',s:true},{n:'Facebook Pixel',s:false},{n:'Slack',s:true},{n:'GitHub',s:true},{n:'AWS S3',s:false},{n:'Stripe',s:true}];
export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Integrations</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {integrations.map(i => (<div key={i.n} className="p-4 rounded-xl border border-gray-200 text-center"><div className="w-10 h-10 rounded-lg bg-gray-100 mx-auto mb-2" /><div className="text-sm font-semibold">{i.n}</div><div className={`text-xs mt-1 ${i.s?'text-green-600':'text-gray-400'}`}>{i.s?'Connected':'Not Connected'}</div></div>))}
        </div>
      </div>
    </div>
  );
}
