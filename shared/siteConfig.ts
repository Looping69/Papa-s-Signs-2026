import { DEFAULT_QUOTE_SETTINGS, validateQuoteSettings } from './quote.js';
import { siteImages } from '../data/papas26Assets.js';
export function validateConfig(value: any) {
  if (!value || typeof value !== 'object' || !value.hero || typeof value.hero.title !== 'string' || typeof value.hero.backgroundImage !== 'string' || !Array.isArray(value.stats) || !Array.isArray(value.gallery) || !Array.isArray(value.services) || value.gallery.length > 5000 || value.services.length > 100) throw new Error('Invalid site configuration.');
  const imageUrl = (src: any) => typeof src === 'string' && (src === '' || /^\/(images|uploads)\/[A-Za-z0-9_./% -]+$/.test(src) && !src.includes('..') || /^https:\/\//i.test(src));
  if (!imageUrl(value.hero.backgroundImage) || value.gallery.some((row: any) => !imageUrl(row?.src)) || value.services.some((row: any) => !imageUrl(row?.image)) || value.images && (typeof value.images !== 'object' || Array.isArray(value.images) || Object.values(value.images).some(src => !imageUrl(src)))) throw new Error('Use supported public image URLs.');
  validateQuoteSettings(value.quoteAssistant);
}
export function normalizeSiteConfig(saved: any, defaults: any) {
  return {
    ...defaults,
    ...saved,
    hero: {
      ...defaults.hero,
      ...saved?.hero
    },
    gallery: saved?.gallery ?? defaults.gallery,
    services: saved?.services ?? defaults.services,
    images: {
      ...siteImages,
      ...saved?.images
    },
    quoteAssistant: saved?.quoteAssistant ?? structuredClone(DEFAULT_QUOTE_SETTINGS)
  };
}
