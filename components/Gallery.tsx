import React, { useState, useEffect } from 'react';
import { fetchConfig, GalleryImage } from '../services/configService';

const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

const isVideoItem = (item: GalleryImage) => item.mediaType === 'video' || VIDEO_FILE_PATTERN.test(item.src);

interface GalleryMediaProps {
  item: GalleryImage;
  isFeatured?: boolean;
}

const LazyMedia: React.FC<GalleryMediaProps> = ({ item, isFeatured }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isVideo = isVideoItem(item);

  return (
    <div 
      className={`relative group overflow-hidden rounded-xl bg-gray-100 transition-all duration-500 ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Placeholder/Loading Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
        </div>
      )}
      
      {isVideo ? (
        <video
          src={item.src}
          aria-label={item.title || 'Gallery video'}
          controls
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <img 
          src={item.src} 
          alt={item.title || 'Gallery item'} 
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchConfig();
        setImages(data.gallery || []);
      } catch (error) {
        console.error("Failed to load gallery config:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const categories = ['All', 'Mining & Safety', 'Branding', 'Retail', 'Digital Print', 'Clothing'];

  const validGalleryItems = images.filter(img => img.src?.trim());
  const filteredImages = filter === 'All' 
    ? validGalleryItems 
    : validGalleryItems.filter(img => img.category === filter);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
      </div>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-xl">
             <h2 className="text-brand-cyan font-bold tracking-wider uppercase mb-3">Our Work</h2>
             <h3 className="text-4xl font-extrabold text-brand-black mb-4">Precision Print & Installation</h3>
             <p className="text-gray-500 text-lg leading-relaxed">
               Showcasing our commitment to quality across Kuruman and the Northern Cape. From heavy-duty mining safety to high-street retail branding.
             </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/30 scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[240px]">
          {filteredImages.map((img, idx) => (
            <LazyMedia
              key={`${img.src}-${idx}`}
              item={img}
              isFeatured={img.featured}
            />
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-lg italic">No projects found in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
