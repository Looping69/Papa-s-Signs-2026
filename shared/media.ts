export interface MediaAsset {
  src: string;
  title: string;
  category: string;
  source: 'portfolio' | 'upload';
  mediaType: 'image' | 'video';
}
export type MediaTarget = {
  type: 'hero';
} | {
  type: 'gallery';
  index: number;
} | {
  type: 'service';
  index: number;
} | {
  type: 'image';
  key: string;
};
export function assignMedia<T extends {
  hero: any;
  gallery: any[];
  services: any[];
  images?: Record<string, string>;
}>(config: T, target: MediaTarget, asset: Pick<MediaAsset, 'src' | 'mediaType'>): T {
  if (target.type !== 'gallery' && asset.mediaType === 'video') throw new Error('Choose an image for this destination.');
  if (target.type === 'hero') return {
    ...config,
    hero: {
      ...config.hero,
      backgroundImage: asset.src
    }
  };
  if (target.type === 'image') return {
    ...config,
    images: {
      ...config.images,
      [target.key]: asset.src
    }
  };
  const list = target.type === 'gallery' ? config.gallery : config.services;
  if (!list[target.index]) throw new Error('This destination no longer exists.');
  return {
    ...config,
    [target.type === 'gallery' ? 'gallery' : 'services']: list.map((item, index) => index === target.index ? {
      ...item,
      ...(target.type === 'gallery' ? {
        src: asset.src,
        mediaType: asset.mediaType
      } : {
        image: asset.src
      })
    } : item)
  };
}
