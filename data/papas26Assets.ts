// Author: Klaasvaakie ( |╲ )

export const papas26Asset = (projectNumber: number): string =>
  `/images/papas26/project-${projectNumber.toString().padStart(4, '0')}.jpg`;

export const galleryCategories = [
  'All',
  'Storefront & Building Branding',
  'Road & Safety',
  'Digital Print & Fabrication',
  'Displays & Events',
  'Vehicle Branding',
  'Awards & Gifts'
] as const;

const projectNumbers = Array.from({ length: 103 }, (_, index) => index + 29)
  .filter(projectNumber => projectNumber !== 107);

const safetyProjects = new Set([
  60, 62, 63, 64, 65, 66, 67, 68, 69, 70, 74, 76, 77, 105, 106, 108, 109, 110, 113, 117, 118, 119
]);
const fabricationProjects = new Set([79, 80, 82, 83, 85, 88, 89, 95, 98, 99, 100, 101, 102, 103, 104]);
const displayProjects = new Set([97, 111, 122, 123, 124, 125, 126]);
const vehicleProjects = new Set([120, 121, 127, 128]);
const awardsProjects = new Set([56, 57, 78, 81]);

const categoryForProject = (projectNumber: number): string => {
  if (safetyProjects.has(projectNumber)) return 'Road & Safety';
  if (fabricationProjects.has(projectNumber)) return 'Digital Print & Fabrication';
  if (displayProjects.has(projectNumber)) return 'Displays & Events';
  if (vehicleProjects.has(projectNumber)) return 'Vehicle Branding';
  if (awardsProjects.has(projectNumber)) return 'Awards & Gifts';
  return 'Storefront & Building Branding';
};

const projectTitles: Record<number, string> = {
  29: 'Full storefront window branding',
  41: 'Optometry privacy window graphics',
  58: 'Illuminated retail fascia sign',
  61: 'Retail storefront fascia and windows',
  64: 'Industrial no-parking safety sign',
  75: 'Dimensional reception wall lettering',
  93: 'Illuminated optometry fascia sign',
  97: 'Portable construction safety displays',
  99: 'Custom dimensional lettering installation',
  105: 'Mining SHE notice board',
  117: 'High-visibility traffic cone production',
  120: 'Commercial vehicle canopy branding',
  121: 'Commercial vehicle wrap',
  122: 'Emergency response gazebo and flag',
  124: "Papa's Signs storefront display",
  127: 'Custom bonnet vehicle graphic',
  128: 'Fleet vehicle branding',
  129: "Papa's Signs illuminated neon signage",
  130: 'Hospital illuminated pylon sign',
  131: "Papa's Signs services showcase"
};

export const papas26Gallery = projectNumbers.map(projectNumber => {
  const category = categoryForProject(projectNumber);
  return {
    src: papas26Asset(projectNumber),
    title: projectTitles[projectNumber] || `${category} project ${projectNumber}`,
    category,
    featured: [61, 93, 124, 128].includes(projectNumber),
    mediaType: 'image' as const
  };
});

export const siteImages = {
  hero: papas26Asset(124),
  workshop: papas26Asset(99),
  signatureSign: papas26Asset(93),
  largeFormat: papas26Asset(105),
  mining: papas26Asset(105),
  corporate: papas26Asset(75),
  retail: papas26Asset(61),
  cta: papas26Asset(129),
  aboutHero: papas26Asset(123),
  production: papas26Asset(99),
  installation: papas26Asset(61)
} as const;

export const serviceImages: Record<string, string> = {
  'advertising-signage': papas26Asset(93),
  'clothing-gifts': papas26Asset(56),
  'display-systems': papas26Asset(122),
  'digital-printing': papas26Asset(82),
  'building-branding': papas26Asset(61),
  'road-safety': papas26Asset(64),
  'vehicle-branding': papas26Asset(121)
};
