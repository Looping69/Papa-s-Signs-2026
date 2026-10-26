import { siteImages, papas26Asset } from './papas26Assets';
import { servicesData } from './servicesData';
const labels: Record<string, string> = {
  workshop: 'Home · Legacy workshop',
  signatureSign: 'Home · Legacy illuminated sign',
  largeFormat: 'Home · Large format printing',
  mining: 'Home · Mining sector',
  corporate: 'Home · Corporate sector',
  retail: 'Home · Retail sector',
  cta: 'Home · Call to action background',
  aboutHero: 'About · Hero background',
  production: 'About · Production',
  installation: 'About · Installation'
};
export const imageSlots = [...Object.entries(siteImages).filter(([key]) => key !== 'hero').map(([key, src]) => ({
  key,
  src,
  label: labels[key] || key
})), ...[99, 119, 120, 128].map((n, i) => ({
  key: `about-team-${n}`,
  src: papas26Asset(n),
  label: `About · Story thumbnail ${i + 1}`
})), ...servicesData.flatMap(service => service.subServices.map(sub => ({
  key: `sub-${service.id}-${sub.id}`,
  src: sub.image || service.image,
  label: `${service.title} · ${sub.title}`
})))];
