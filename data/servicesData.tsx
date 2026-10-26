// Author: Klaasvaakie ( |╲ )
import React from 'react';
import { 
  Printer, Store, PenTool, HardHat, TriangleAlert, 
  Shirt, Factory, Wrench, Flag, Layout, Box, 
  FileText, Layers, Image, Car, Monitor, Scissors
} from 'lucide-react';
import { Service } from '../types';
import { papas26Asset, serviceImages } from './papas26Assets';

export const servicesData: Service[] = [
  {
    id: 'advertising-signage',
    title: 'Advertising & Signage',
    description: 'High-impact visibility solutions for businesses of all sizes. From massive billboards to intricate 3D shopfronts, we manufacture custom signage that commands attention.',
    icon: <Store className="w-8 h-8 text-white" />,
    image: serviceImages['advertising-signage'],
    materials: ['UV-resistant PVC', 'Chromadeck (Steel)', 'Perspex (Acrylic)', 'Aluminium', 'LED Lighting'],
    turnaround: '5-10 working days depending on complexity',
    usp: 'In-house fabrication workshop allowing for complete custom structures and rapid prototyping.',
    subServices: [
      { id: 'banners-flags', title: 'Banners & Flags', description: 'Promotional outdoor and indoor display tools using high-tenacity polyester and UV-stable inks.', image: papas26Asset(126), materials: ['Polyester Mesh', 'PVC'], turnaround: '3-5 days' },
      { id: 'billboards', title: 'Billboards', description: 'Large-scale advertising structures engineered for wind resistance and maximum visibility.', image: papas26Asset(113), materials: ['Galvanized Steel', 'Heavy-duty PVC'], turnaround: '10-14 days' },
      { id: 'chromadeck', title: 'Chromadeck Signs', description: 'Durable, weather-resistant metal signage ideal for industrial and retail environments.', image: papas26Asset(105), materials: ['0.6mm - 0.8mm Chromadeck Steel'], turnaround: '5 days' },
      { id: 'large-format', title: 'Large Format Printing', description: 'High-quality printing for oversized graphics up to 3.2m width seamless.', image: papas26Asset(89), materials: ['Vinyl', 'PVC', 'Contravision'], turnaround: '2-3 days' },
      { id: 'letter-cuts', title: 'Letter Cut-outs', description: '3D or 2D individual letters for shop fronts with optional LED backlighting.', image: papas26Asset(99), materials: ['Perspex', 'Aluminium', 'Foam Board'], turnaround: '7-10 days' },
      { id: 'lightboxes', title: 'Lightboxes', description: 'Illuminated display cases for high night visibility using energy-efficient LED technology.', image: papas26Asset(129), materials: ['Aluminium Extrusion', 'Acrylic Face', 'LEDs'], turnaround: '7-10 days' },
      { id: 'perspex', title: 'Perspex Signs', description: 'Modern, high-end acrylic signage with flame-polished edges for a premium finish.', image: papas26Asset(100), materials: ['3mm - 10mm Perspex'], turnaround: '5-7 days' }
    ]
  },
  {
    id: 'clothing-gifts',
    title: 'Clothing & Gifts',
    description: 'Branded apparel and custom gifts to build your brand identity. We offer embroidery, screen printing, and heat transfer for all corporate and school requirements.',
    icon: <Shirt className="w-8 h-8 text-white" />,
    image: serviceImages['clothing-gifts'],
    materials: ['Cotton', 'Polyester', 'Ceramic', 'Metal'],
    turnaround: '7-14 working days for bulk orders',
    usp: 'No minimum order quantity on selected gift items and rapid turnaround on embroidery.',
    subServices: [
      { id: 'corp-clothing', title: 'Corporate Clothing', description: 'Branded apparel and items for business promotion from top South African suppliers.', image: papas26Asset(111), materials: ['Barron', 'Altitude', 'Amrod ranges'], turnaround: '10 days' },
      { id: 'embroidery', title: 'Embroidery', description: 'High-stitch count precision embroidery for a professional, long-lasting look.', image: papas26Asset(111), materials: ['Polyester Thread'], turnaround: '5-7 days' },
      { id: 'iron-on', title: 'Iron-On', description: 'Heat-transfer graphics for clothing, ideal for sports kits and small runs.', image: papas26Asset(111), materials: ['PU Vinyl', 'Flock'], turnaround: '2-3 days' },
      { id: 'keyrings', title: 'Key Rings', description: 'Custom-branded keychains in various shapes and materials.', image: papas26Asset(57), materials: ['Metal', 'Acrylic', 'Leather'], turnaround: '5 days' },
      { id: 'mugs', title: 'Mugs', description: 'Personalized or branded drinking mugs with high-gloss sublimation printing.', image: papas26Asset(56), materials: ['Ceramic'], turnaround: '2-3 days' },
      { id: 'school-sports', title: 'School & Sports', description: 'Uniforms and activewear for teams with durable numbering and logos.', image: papas26Asset(78), materials: ['Moisture-wicking fabric'], turnaround: '10-14 days' },
      { id: 'tshirt-printing', title: 'T-shirt Printing', description: 'Custom graphics printed on t-shirts using screen print or digital transfer.', image: papas26Asset(111), materials: ['Cotton', 'Poly-cotton'], turnaround: '5-7 days' }
    ]
  },
  {
    id: 'display-systems',
    title: 'Display Systems',
    description: 'Portable and professional display solutions for events, exhibitions, and retail promotions. Lightweight and easy to assemble.',
    icon: <Layout className="w-8 h-8 text-white" />,
    image: serviceImages['display-systems'],
    materials: ['Aluminium Frames', 'Sublimated Fabric', 'Stay-flat PVC'],
    turnaround: '3-5 working days',
    usp: 'Includes high-quality carry bags and a 1-year warranty on all hardware systems.',
    subServices: [
      { id: 'banner-walls', title: 'Banner Walls', description: 'Large backdrops for events or interviews with easy-change fabric faces.', image: papas26Asset(97), materials: ['Aluminium Concertina Frame', 'Fabric'], turnaround: '5 days' },
      { id: 'gazebos', title: 'Gazebos', description: 'Branded outdoor tents for events with heavy-duty frames for windy conditions.', image: papas26Asset(122), materials: ['Steel or Aluminium Frame', 'Waterproof Canvas'], turnaround: '7 days' },
      { id: 'pop-up', title: 'Pop-up Banners', description: 'Collapsible, easy-to-set-up displays for indoor promotions.', image: papas26Asset(97), materials: ['Spring Steel', 'Fabric'], turnaround: '3 days' },
      { id: 'poster-frames', title: 'Poster Frames', description: 'Snap frames for displaying posters with protective anti-glare covers.', image: papas26Asset(97), materials: ['Anodized Aluminium'], turnaround: '1-2 days' },
      { id: 'pull-up', title: 'Pull Up Banners', description: 'Retractable stands for portability with high-resolution non-curl prints.', image: papas26Asset(97), materials: ['Aluminium Base', 'Non-curl PVC'], turnaround: '2 days' },
      { id: 'teardrop', title: 'Teardrop Banners', description: 'Outdoor flags in unique shapes with ground spikes or cross-bases.', image: papas26Asset(126), materials: ['Fibreglass Poles', 'Warp-knit Fabric'], turnaround: '3-5 days' },
      { id: 'x-banners', title: 'X-Banners', description: 'Lightweight, cost-effective stands for high-volume indoor displays.', image: papas26Asset(97), materials: ['Carbon Fibre/Plastic Frame'], turnaround: '2 days' }
    ]
  },
  {
    id: 'digital-printing',
    title: 'Digital Printing',
    description: 'Precision paper and material printing for everyday business needs. We use high-speed Xerox and Konica Minolta technology for crisp, accurate results.',
    icon: <Printer className="w-8 h-8 text-white" />,
    image: serviceImages['digital-printing'],
    materials: ['Bond Paper', 'Gloss/Matt Art', 'Cardstock', 'Self-adhesive Vinyl'],
    turnaround: 'Same-day to 48 hours',
    usp: 'High-volume capacity with on-site finishing (binding, cutting, laminating) for immediate pickup.',
    subServices: [
      { id: 'business-cards', title: 'Business Cards', description: 'Standard corporate identity cards with optional UV spot or lamination.', image: papas26Asset(82), materials: ['350gsm Triple Coated Card'], turnaround: '24-48 hours' },
      { id: 'calendars', title: 'Calendars', description: 'Custom-printed annual calendars in desk, wall, or tent formats.', image: papas26Asset(89), materials: ['170gsm Art Paper'], turnaround: '5 days' },
      { id: 'canvas', title: 'Canvas Printing', description: 'Graphics printed on artistic canvas material and stretched over wooden frames.', image: papas26Asset(96), materials: ['380gsm Cotton Canvas'], turnaround: '3 days' },
      { id: 'labels', title: 'Labels', description: 'Custom stickers for packaging with precision contour cutting.', image: papas26Asset(88), materials: ['Gloss/Matt Vinyl', 'Paper Labels'], turnaround: '2 days' },
      { id: 'lamination', title: 'Lamination', description: 'Protective coating for documents from ID size up to A0.', image: papas26Asset(95), materials: ['80mic - 250mic Film'], turnaround: 'While you wait' },
      { id: 'posters-flyers', title: 'Posters & Flyers', description: 'Promotional marketing materials in high-vibrancy colors.', image: papas26Asset(31), materials: ['115gsm - 250gsm Paper'], turnaround: '24 hours' },
      { id: 'stickers', title: 'Stickers', description: 'Adhesive graphics in various sizes, water-resistant and durable.', image: papas26Asset(108), materials: ['Monomeric/Polymeric Vinyl'], turnaround: '2 days' }
    ]
  },
  {
    id: 'building-branding',
    title: 'Building Branding',
    description: 'Transform your premises into a powerful branding tool. We specialize in exterior and interior office branding that reflects your corporate identity.',
    icon: <Factory className="w-8 h-8 text-white" />,
    image: serviceImages['building-branding'],
    materials: ['Sandblast Vinyl', 'Wall-wrap Vinyl', 'Contravision', 'Cut-out Letters'],
    turnaround: '5-7 working days for installation',
    usp: 'Professional installation teams with heights certification and site-specific safety training.',
    subServices: [
      { id: 'sandblasting', title: 'Sandblasting Decoratives', description: 'Artistic window transformation for privacy and elegance in offices.', image: papas26Asset(41), materials: ['Frosted Vinyl'], turnaround: '5 days' },
      { id: 'vinyl-cuts', title: 'Vinyl Cut-outs', description: 'Precision-cut graphics for walls, glass, and reception areas.', image: papas26Asset(35), materials: ['7-year Outdoor Vinyl'], turnaround: '3 days' },
      { id: 'wallpapers', title: 'Wallpapers', description: 'Custom-printed wall coverings for feature walls and boardrooms.', image: papas26Asset(73), materials: ['Textured Wallpaper Fabric'], turnaround: '5 days' },
      { id: 'window-branding', title: 'Window Branding', description: 'Contravision (one-way vision) and full-color privacy graphics.', image: papas26Asset(29), materials: ['Perforated Vinyl'], turnaround: '5 days' }
    ]
  },
  {
    id: 'road-safety',
    title: 'Road & Safety Signs',
    description: 'Compliant signage for mines, construction, and public roads. We are the Northern Cape specialists in SABS-approved safety communication.',
    icon: <TriangleAlert className="w-8 h-8 text-white" />,
    image: serviceImages['road-safety'],
    materials: ['Reflective Sheeting (Class 1, 2, 3)', 'Galvanized Steel', 'ABS Plastic'],
    turnaround: '3-5 working days for standard signs',
    usp: 'Deep understanding of Mine Health and Safety Act requirements and SABS 1186 standards.',
    subServices: [
      { id: 'reflective', title: 'Reflective Tape', description: 'High-visibility safety markings for vehicles and industrial equipment.', image: papas26Asset(108), materials: ['Honey-comb Reflective Tape'], turnaround: '1 day' },
      { id: 'road-signs', title: 'Road Signs', description: 'Standard traffic regulation signs manufactured to national specifications.', image: papas26Asset(60), materials: ['Galvanized Steel', 'Reflective Vinyl'], turnaround: '5-7 days' },
      { id: 'safety-signs', title: 'Safety Signs', description: 'Mandatory OHS compliance signage for industrial and mining sites.', image: papas26Asset(105), materials: ['ABS', 'Chromadeck', 'Photoluminescent'], turnaround: '3 days' }
    ]
  },
  {
    id: 'vehicle-branding',
    title: 'Vehicle Branding',
    description: 'Mobile advertising that travels wherever you do. From simple door magnets to full commercial fleet wraps.',
    icon: <Car className="w-8 h-8 text-white" />,
    image: serviceImages['vehicle-branding'],
    materials: ['Cast Wrap Vinyl', 'Magnetic Sheeting', 'Reflective Decals'],
    turnaround: '2-4 working days per vehicle',
    usp: 'Dust-free application bay in Kuruman ensuring a bubble-free, long-lasting finish.',
    subServices: [
      { id: 'magnets', title: 'Branding Magnets', description: 'Removable magnetic door signs for multi-use vehicles.', image: papas26Asset(127), materials: ['0.8mm Magnetic Sheet'], turnaround: '1 day' },
      { id: 'graphics', title: 'Vehicle Graphics', description: 'Vinyl decals and partial wraps designed for high-speed durability.', image: papas26Asset(121), materials: ['Avery/3M Wrap Film'], turnaround: '3 days' },
      { id: 'visibility', title: 'Visibility Decals', description: 'Reflective safety markings and chevrons for mine-site compliance.', image: papas26Asset(128), materials: ['Class 1/2 Reflective Vinyl'], turnaround: '2 days' }
    ]
  }
];
