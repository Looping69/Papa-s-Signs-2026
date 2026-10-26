import React from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { DEFAULT_QUOTE_MESSAGES, STAFF_DISCLAIMER, type QuoteSettings, type QuoteService } from '../../shared/quote';
export default function QuoteSettingsEditor({
  value,
  onChange
}: {
  value: QuoteSettings;
  onChange: (value: QuoteSettings) => void;
}) {
  const update = (index: number, patch: Partial<QuoteService>) => onChange({
    ...value,
    services: value.services.map((row, i) => i === index ? {
      ...row,
      ...patch
    } : row)
  });
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-4 justify-between items-center"><div><h2 className="text-2xl font-black">Smart Quote Controls</h2><p className="text-gray-500 text-sm mt-2">Approved staff rates only. Changes publish when you save.</p></div><label className="flex items-center gap-3 font-bold bg-gray-50 border p-4 rounded-xl"><input type="checkbox" className="w-5 h-5" checked={value.enabled} onChange={e => onChange({
          ...value,
          enabled: e.target.checked
        })} />Visible on website</label></div>
    <div className="bg-sky-50 border border-sky-100 p-5 rounded-xl text-sm"><ShieldCheck className="w-5 h-5 mb-2 text-brand-cyan" /><p className="font-bold">Staff approval is always required</p><p className="mt-1">{STAFF_DISCLAIMER}</p><p className="mt-2">No rates are pre-approved. Add and enable only services with verified pricing. Custom requests go to staff. This does not create an approval inbox or send a notification.</p></div>
    <div className="flex justify-between items-center gap-3"><h3 className="font-black text-lg">Service pricing</h3><button className="inline-flex gap-2 items-center bg-brand-black text-white rounded-lg px-4 py-2 text-sm font-bold" onClick={() => onChange({
        ...value,
        services: [...value.services, {
          id: `service-${Date.now()}`,
          title: 'New service',
          enabled: false,
          basis: 'item',
          rate: null,
          minimumCharge: 0,
          packageQuantity: 1,
          requiredDetails: []
        }]
      })}><Plus className="w-4 h-4" />Add pricing rule</button></div>
    {!value.services.length && <p className="border border-dashed rounded-xl p-8 text-gray-500 text-center">No approved rates yet. Add a pricing rule to offer provisional estimates.</p>}
    {value.services.map((row, index) => <div key={row.id} className="border rounded-xl p-5 bg-gray-50 space-y-4">
      <div className="flex justify-between gap-4"><label className="text-sm font-bold flex gap-2 items-center"><input type="checkbox" checked={row.enabled} onChange={e => update(index, {
            enabled: e.target.checked
          })} />Allow estimates for this service</label><button className="text-red-600 text-sm underline" onClick={() => onChange({
          ...value,
          services: value.services.filter((_, i) => i !== index)
        })}>Remove rule</button></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <label className="text-xs font-bold">Service name<input aria-label={`Service name ${index + 1}`} value={row.title} maxLength={120} onChange={e => update(index, {
            title: e.target.value
          })} className="mt-2 border rounded-lg p-3 w-full text-sm" /></label>
        <label className="text-xs font-bold">Pricing basis<select value={row.basis} onChange={e => update(index, {
            basis: e.target.value as QuoteService['basis']
          })} className="mt-2 border rounded-lg p-3 w-full text-sm"><option value="item">Per item</option><option value="area">Per square metre</option><option value="package">Per package (round up)</option></select></label>
        <label className="text-xs font-bold">Rate (ZAR)<input aria-label={`Rate ZAR ${index + 1}`} type="number" min="0" max="1000000" step="0.01" placeholder="Not configured" value={row.rate ?? ''} onChange={e => update(index, {
            rate: e.target.value === '' ? null : Number(e.target.value)
          })} className="mt-2 border rounded-lg p-3 w-full text-sm" /></label>
        <label className="text-xs font-bold">Minimum charge (ZAR)<input type="number" min="0" step="0.01" value={row.minimumCharge} onChange={e => update(index, {
            minimumCharge: Number(e.target.value)
          })} className="mt-2 border rounded-lg p-3 w-full text-sm" /></label>
        {row.basis === 'package' && <label className="text-xs font-bold">Items in one package<input type="number" min="1" max="10000" step="1" value={row.packageQuantity} onChange={e => update(index, {
            packageQuantity: Number(e.target.value)
          })} className="mt-2 border rounded-lg p-3 w-full text-sm" /></label>}
      </div>
      <div className="flex flex-wrap gap-5 text-sm">{(['material', 'details'] as const).map(key => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={row.requiredDetails.includes(key)} onChange={e => update(index, {
            requiredDetails: e.target.checked ? [...row.requiredDetails, key] : row.requiredDetails.filter(k => k !== key)
          })} />{key === 'material' ? 'Require material' : 'Require custom details (staff assessment only)'}</label>)}</div>
      {row.requiredDetails.includes('material') && <label className="block text-xs font-bold">Approved materials for this rate (one per line)<textarea rows={3} value={(row.allowedMaterials || []).join('\n')} onChange={e => update(index, {
          allowedMaterials: e.target.value.split('\n')
        })} onBlur={() => update(index, {
          allowedMaterials: (row.allowedMaterials || []).map(value => value.trim()).filter(Boolean)
        })} className="mt-2 border rounded-lg p-3 w-full text-sm" /><span className="text-xs font-normal text-gray-500">Other materials require staff assessment. An empty list cannot produce a material-specific estimate.</span></label>}
    </div>)}
    <h3 className="font-black text-lg pt-4">Controlled response messages</h3><p className="text-sm text-gray-500">These messages cannot remove the mandatory disclaimer, change calculations or approve quotes.</p>
    <div className="grid md:grid-cols-2 gap-4">{(Object.keys(DEFAULT_QUOTE_MESSAGES) as (keyof typeof DEFAULT_QUOTE_MESSAGES)[]).map(key => <label key={key} className="text-xs font-bold capitalize">{key}<textarea maxLength={500} rows={3} value={value.messages[key] ?? ''} placeholder={DEFAULT_QUOTE_MESSAGES[key]} onChange={e => onChange({
          ...value,
          messages: {
            ...value.messages,
            [key]: e.target.value
          }
        })} className="block mt-2 w-full rounded-lg border p-3 text-sm font-normal" /></label>)}</div>
    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-4 rounded-lg">Password-protected local administration. Remote access remains disabled; do not expose this development server through a public proxy.</p>
  </div>;
}
