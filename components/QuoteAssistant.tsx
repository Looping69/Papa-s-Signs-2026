import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calculator, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from './SiteConfigProvider';
import { STAFF_DISCLAIMER, type EstimateResult, type QuoteService } from '../shared/quote';
type PublicService = Pick<QuoteService, 'id' | 'title' | 'basis' | 'packageQuantity' | 'requiredDetails'>;
export default function QuoteAssistant({
  initialMessage
}: {
  initialMessage?: string;
}) {
  const {config}=useSiteConfig();
  const failureMessage=config?.quoteAssistant?.messages.failure?.trim() || 'We could not prepare an estimate. Please contact our staff.';
  const [services, setServices] = useState<PublicService[]>([]),
    [serviceId, setServiceId] = useState('');
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [quantity, setQuantity] = useState(''),
    [width, setWidth] = useState(''),
    [height, setHeight] = useState(''),
    [material, setMaterial] = useState(''),
    [details, setDetails] = useState('');
  const [result, setResult] = useState<EstimateResult | null>(null);
  const service = services.find(row => row.id === serviceId);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/quote/settings').then(async response => {
      if (!response.ok) throw new Error('Online estimates are unavailable.');
      const data = await response.json();
      if (!cancelled) setServices(data.enabled ? data.services : []);
    }).catch(() => {
      if (!cancelled) setError(failureMessage);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [failureMessage]);
  useEffect(() => {
    setResult(null);
  }, [serviceId, quantity, width, height, material, details]);
  const handoffBody = result ? [result.serviceTitle || service?.title || 'Custom project', 'Quantity: ' + quantity, width && height ? 'Size: ' + width + 'm x ' + height + 'm' : '', material ? 'Material: ' + material : '', details ? 'Notes: ' + details : '', result.amount !== undefined ? 'Provisional estimate: R' + result.amount.toFixed(2) + ' (not approved)' : '', 'Please review these specifications and provide a final quote.'].filter(Boolean).join('\n') : initialMessage || 'Please help me with a quote.';
  return <section id="quote-assistant" className="py-12 sm:py-20 bg-gray-100"><div className="max-w-5xl mx-auto px-4"><div className="bg-white rounded-3xl shadow-xl overflow-hidden md:grid md:grid-cols-3">
    <aside className="bg-brand-dark p-7 sm:p-10 text-white"><Calculator className="w-9 h-9 text-brand-cyan mb-5" /><h1 className="text-3xl font-black mb-4">Smart Quote Assistant</h1><p className="text-gray-300 text-sm leading-relaxed">Select a service and enter your specifications. Estimates use staff-configured rates, never AI-generated prices.</p><div className="mt-8 border border-white/20 rounded-xl p-4"><ShieldCheck className="w-6 h-6 text-brand-cyan mb-3" /><p className="font-bold text-sm">Staff approval required</p><p className="text-xs text-gray-300 mt-2">{STAFF_DISCLAIMER}</p></div><p className="text-xs text-gray-400 mt-6">Custom jobs, installation, discounts and delivery guarantees need a staff assessment.</p></aside>
    <div className="md:col-span-2 p-6 sm:p-10">
      <h2 className="text-xl font-black mb-2">Tell us what you need</h2>{initialMessage && <p className="text-sm text-gray-500 mb-4">Your request: {initialMessage}</p>}
      {loading ? <p role="status" className="py-8 text-gray-500">Loading available services…</p> : !services.length ? <div className="py-8"><p className="text-gray-600">{error || 'Online rates are not configured yet. Our staff can help you with a tailored quote.'}</p><Link to="/contact" className="mt-5 inline-block text-brand-cyan font-bold">Contact our staff</Link></div> : <form onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            setError('');
            setResult(null);
            try {
              const response = await fetch('/api/quote/estimate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  serviceId,
                  quantity: quantity ? Number(quantity) : undefined,
                  ...(service?.basis === 'area' ? {
                    width: width ? Number(width) : undefined,
                    height: height ? Number(height) : undefined
                  } : {}),
                  material,
                  details
                }),
                signal: AbortSignal.timeout(10000)
              });
              const data = await response.json();
              if (!response.ok && data.status !== 'invalid' && data.status !== 'disabled') {
                setError(data.error || failureMessage);
                return;
              }
              setResult(data);
            } catch {
              setError(failureMessage);
            } finally {
              setBusy(false);
            }
          }} className="mt-6 space-y-5">
        <label className="block font-bold text-sm">Service<select required disabled={busy} value={serviceId} onChange={e => {
                setServiceId(e.target.value);
                setMaterial('');
                setDetails('');
              }} className="block w-full mt-2 p-3 rounded-xl border bg-gray-50"><option value="">Choose a service</option>{services.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label>
        {service && <fieldset disabled={busy} className="space-y-5"><p className="text-xs text-gray-500">Pricing basis: {service.basis === 'area' ? 'per square metre' : service.basis === 'package' ? 'package of ' + service.packageQuantity + ' items; partial packages round up' : 'per item'}. Enter total item quantity.</p><label className="block font-bold text-sm">Quantity<input required type="number" min="1" max="10000" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="block w-full mt-2 p-3 rounded-xl border" /></label>
        {service.basis === 'area' && <div className="grid grid-cols-2 gap-4"><label className="text-sm font-bold">Width (metres)<input required type="number" min="0.001" max="100" step="0.001" value={width} onChange={e => setWidth(e.target.value)} className="block mt-2 p-3 rounded-xl border w-full" /></label><label className="text-sm font-bold">Height (metres)<input required type="number" min="0.001" max="100" step="0.001" value={height} onChange={e => setHeight(e.target.value)} className="block mt-2 p-3 rounded-xl border w-full" /></label></div>}
        {service.requiredDetails.includes('material') && <label className="block text-sm font-bold">Material<input required maxLength={1000} value={material} onChange={e => setMaterial(e.target.value)} className="block mt-2 p-3 rounded-xl border w-full" /></label>}
        <label className="block text-sm font-bold">Custom requirements {service.requiredDetails.includes('details') ? '(required)' : '(optional)'}<textarea required={service.requiredDetails.includes('details')} maxLength={1000} value={details} onChange={e => setDetails(e.target.value)} className="block mt-2 p-3 rounded-xl border w-full" rows={3} /><span className="text-xs font-normal text-gray-500">Adding custom requirements routes the request to staff rather than calculating an unverified price.</span></label>
        <button disabled={busy} className="bg-brand-black text-white rounded-xl px-6 py-3 font-bold disabled:opacity-50">{busy ? 'Checking specifications…' : 'Prepare provisional estimate'}</button></fieldset>}
      </form>}
      {error && <p role="alert" className="mt-5 p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</p>}
      {result && <div role="status" className="mt-6 p-5 bg-sky-50 border border-sky-100 rounded-xl"><p className="font-bold">{result.message}</p>{result.amount !== undefined && <p className="text-3xl font-black mt-3">{new Intl.NumberFormat('en-ZA', {
                style: 'currency',
                currency: 'ZAR'
              }).format(result.amount)}</p>}{result.missing && <p className="text-sm mt-2">Required: {result.missing.join(', ')}</p>}<p className="text-xs text-gray-600 mt-3">{result.disclaimer}</p><p className="text-xs mt-3 text-gray-500">Not sent to staff. Use the email link below to request review.</p></div>}
      <div className="mt-8 pt-5 border-t flex flex-wrap gap-4 text-sm font-bold"><a href={'mailto:sales@papassigns.co.za?subject=' + encodeURIComponent('Quote review request') + '&body=' + encodeURIComponent(handoffBody)} className="inline-flex items-center gap-2 text-brand-cyan">Email staff for review <ArrowRight className="w-4 h-4" /></a><Link to="/contact" className="text-gray-500">Other contact options</Link></div>
    </div>
  </div></div></section>;
}
