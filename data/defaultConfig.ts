import { papas26Gallery, serviceImages, siteImages } from './papas26Assets.js';
import { normalizeSiteConfig } from '../shared/siteConfig.js';

export const defaultConfig = normalizeSiteConfig({}, {
  hero: {title: 'PRINTING EXPERTISE', subtitle: 'EXPERTISE', description: "Kuruman's premier signage manufacturing hub. Specialized for the Mining & Construction sectors with national compliance.", backgroundImage: siteImages.hero},
  stats: [{id:'01',title:'Mine Compliance',label:'SABS Standards'},{id:'02',title:'Fast Delivery',label:'Northern Cape Wide'},{id:'03',title:'Scale Experts',label:'Large Format Specialist'}],
  gallery: papas26Gallery,
  services: [
    ['advertising-signage','Advertising & Signage','High-impact visibility solutions for businesses of all sizes.','Store'],
    ['clothing-gifts','Clothing & Gifts','Branded apparel and custom gifts to build your brand identity.','Shirt'],
    ['display-systems','Display Systems','Portable and professional display solutions for events.','Layout'],
    ['digital-printing','Digital Printing','Precision paper and material printing for everyday business needs.','Printer'],
    ['building-branding','Building Branding','Transform your premises into a powerful branding tool.','Factory'],
    ['road-safety','Road & Safety Signs','Compliant signage for mines, construction, and public roads.','TriangleAlert'],
    ['vehicle-branding','Vehicle Branding','Mobile advertising that travels wherever you do.','Car']
  ].map(([id,title,description,icon]) => ({id,title,description,icon,image:serviceImages[id]}))
});
