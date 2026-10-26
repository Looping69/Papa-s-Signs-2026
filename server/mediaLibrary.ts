import fs from 'node:fs';
import path from 'node:path';
import type { MediaAsset } from '../shared/media';
export function listMediaAssets(publicDir: string, gallery: {
  src: string;
  title?: string;
  category?: string;
}[]): MediaAsset[] {
  const assets: MediaAsset[] = [];
  for (const [folder, source] of [['images/papas26', 'portfolio'], ['uploads', 'upload']] as const) {
    const directory = path.join(publicDir, folder);
    if (!fs.existsSync(directory) || fs.lstatSync(directory).isSymbolicLink()) continue;
    const entries = fs.readdirSync(directory, {
      withFileTypes: true
    }).filter(entry => entry.isFile());
    const originals = new Set(entries.filter(entry => /\.(jpg|jpeg|png)$/i.test(entry.name)).map(entry => path.parse(entry.name).name.toLowerCase()));
    for (const entry of entries) {
      if (!/\.(jpg|jpeg|png|webp|gif|avif|mp4|webm|ogg|mov|m4v)$/i.test(entry.name)) continue;
      if (source === 'portfolio' && /\.webp$/i.test(entry.name) && originals.has(path.parse(entry.name).name.toLowerCase())) continue;
      const src = `/${folder}/${encodeURIComponent(entry.name)}`;
      const metadata = gallery.find(item => item.src === src);
      assets.push({
        src,
        title: metadata?.title || entry.name,
        category: metadata?.category || (source === 'portfolio' ? 'Portfolio' : 'Uploads'),
        source,
        mediaType: /\.(mp4|webm|ogg|mov|m4v)$/i.test(entry.name) ? 'video' : 'image'
      });
    }
  }
  return assets.sort((a, b) => a.source === b.source ? a.src.localeCompare(b.src) : a.source === 'upload' ? -1 : 1);
}
