import { DEFAULT_QUOTE_SETTINGS } from './quote';
import { siteImages } from '../data/papas26Assets';
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
