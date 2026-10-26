export type PricingBasis = 'item' | 'area' | 'package';
export interface QuoteService {
  id: string;
  title: string;
  enabled: boolean;
  basis: PricingBasis;
  rate: number | null;
  minimumCharge: number;
  packageQuantity: number;
  requiredDetails: ('material' | 'details')[];
  allowedMaterials?: string[];
}
export interface QuoteSettings {
  enabled: boolean;
  services: QuoteService[];
  messages: Partial<Record<'missing' | 'handoff' | 'unavailable' | 'failure', string>>;
}
export const STAFF_DISCLAIMER = 'Provisional estimate only — staff must review your specifications and approve the final quote. This is not an invoice or an accepted order. Tax, design, delivery and installation inclusions must be confirmed by staff.';
export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
  enabled: false,
  services: [],
  messages: {}
};
export const DEFAULT_QUOTE_MESSAGES = {
  missing: 'Please complete the required specifications before we can estimate.',
  handoff: 'This request needs a staff assessment. Please contact our office for a quote.',
  unavailable: 'Online estimates are currently unavailable. Please contact our office.',
  failure: 'We could not prepare an estimate. Please contact our office.'
};
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const money = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1_000_000 && Math.abs(v * 100 - Math.round(v * 100)) < 0.000001;
export function validateQuoteSettings(value: unknown): asserts value is QuoteSettings {
  if (!object(value) || typeof value.enabled !== 'boolean' || !Array.isArray(value.services) || value.services.length > 100 || !object(value.messages)) throw new Error('Invalid quote settings.');
  const ids = new Set<string>();
  for (const row of value.services) {
    if (!object(row) || typeof row.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(row.id) || ids.has(row.id) || typeof row.title !== 'string' || !row.title.trim() || row.title.length > 120 || typeof row.enabled !== 'boolean') throw new Error('Invalid or duplicate quote service.');
    ids.add(row.id);
    if (!['item', 'area', 'package'].includes(row.basis) || !(row.rate === null || money(row.rate)) || row.enabled && row.rate === null || !money(row.minimumCharge) || !Number.isInteger(row.packageQuantity) || row.packageQuantity < 1 || row.packageQuantity > 10000) throw new Error('Use valid rates (up to two decimals), pricing units and package quantities. Enabled services require a rate.');
    if (!Array.isArray(row.requiredDetails) || row.requiredDetails.some((key: unknown) => !['material', 'details'].includes(key as string))) throw new Error('Invalid specification gate.');
    if (row.allowedMaterials !== undefined && (!Array.isArray(row.allowedMaterials) || row.allowedMaterials.length > 30 || row.allowedMaterials.some((text: unknown) => typeof text !== 'string' || !text.trim() || text.length > 100))) throw new Error('Use up to 30 approved material names.');
  }
  for (const [key, text] of Object.entries(value.messages)) if (!['missing', 'handoff', 'unavailable', 'failure'].includes(key) || typeof text !== 'string' || text.length > 500) throw new Error('Response messages must be at most 500 characters.');
}
export interface EstimateRequest {
  serviceId?: string;
  quantity?: number;
  width?: number;
  height?: number;
  material?: string;
  details?: string;
}
export interface EstimateResult {
  status: 'disabled' | 'invalid' | 'handoff' | 'needs_details' | 'estimate';
  message: string;
  disclaimer: string;
  requiresStaffApproval: true;
  amount?: number;
  currency?: 'ZAR';
  missing?: string[];
  serviceTitle?: string;
  basis?: PricingBasis;
  quantity?: number;
}
export function calculateEstimate(settings: QuoteSettings, input: unknown): EstimateResult {
  const result = (status: EstimateResult['status'], message: string, extra = {}): EstimateResult => ({
    status,
    message,
    disclaimer: STAFF_DISCLAIMER,
    requiresStaffApproval: true,
    ...extra
  });
  const msg = (key: keyof typeof DEFAULT_QUOTE_MESSAGES) => settings?.messages?.[key]?.trim() || DEFAULT_QUOTE_MESSAGES[key];
  if (settings?.enabled !== true) return result('disabled', msg('unavailable'));
  try {
    validateQuoteSettings(settings);
  } catch {
    return result('handoff', DEFAULT_QUOTE_MESSAGES.handoff);
  }
  if (!object(input) || typeof input.serviceId !== 'string' || input.serviceId.length > 120) return result('invalid', 'Select a valid service.');
  const service = settings.services.find(row => row.id === input.serviceId && row.enabled && row.rate !== null);
  if (!service) return result('handoff', msg('handoff'));
  const missing: string[] = [];
  if (input.quantity === undefined || input.quantity === null) missing.push('quantity');else if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 10000) return result('invalid', 'Quantity must be a whole number from 1 to 10000.');
  for (const key of ['width', 'height'] as const) {
    if (service.basis === 'area' && (input[key] === undefined || input[key] === null)) missing.push(key);else if (input[key] !== undefined && input[key] !== null && (typeof input[key] !== 'number' || !Number.isFinite(input[key]) || input[key] <= 0 || input[key] > 100)) return result('invalid', 'Dimensions must be greater than zero and at most 100 metres.');
  }
  for (const key of ['material', 'details'] as const) {
    if (input[key] !== undefined && (typeof input[key] !== 'string' || input[key].length > 1000)) return result('invalid', 'Specifications must be text of at most 1000 characters.');
    if (service.requiredDetails.includes(key) && !input[key]?.trim()) missing.push(key);
  }
  if (missing.length) return result('needs_details', msg('missing'), {
    missing
  });
  if (input.material?.trim() && !service.allowedMaterials?.some(value => value.trim().toLowerCase() === input.material.trim().toLowerCase())) return result('handoff', msg('handoff'));
  // Text is never interpreted as instructions, pricing, approval, or a supported custom specification.
  if (input.details?.trim()) return result('handoff', msg('handoff'));
  const units = service.basis === 'area' ? input.quantity * input.width * input.height : service.basis === 'package' ? Math.ceil(input.quantity / service.packageQuantity) : input.quantity;
  const amount = Math.max(Math.round(units * Math.round(service.rate! * 100)), Math.round(service.minimumCharge * 100)) / 100;
  if (!Number.isFinite(amount) || amount > 10_000_000) return result('handoff', msg('handoff'));
  return result('estimate', 'Your provisional estimate is ready for staff review.', {
    amount,
    currency: 'ZAR',
    serviceTitle: service.title,
    basis: service.basis,
    quantity: input.quantity
  });
}
