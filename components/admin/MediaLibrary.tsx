import React, { useEffect, useRef, useState } from 'react';
import { Search, Upload, X, Check, Film, RefreshCw } from 'lucide-react';
import { uploadMedia, adminRequest } from '../../services/configService';
import type { MediaAsset } from '../../shared/media';
interface Props {
  onSelect?: (asset: MediaAsset) => void;
  onClose?: () => void;
  imagesOnly?: boolean;
  title?: string;
  currentSrc?: string;
}
export default function MediaLibrary({
  onSelect,
  onClose,
  imagesOnly = false,
  title = 'Media Library',
  currentSrc
}: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]),
    [query, setQuery] = useState(''),
    [source, setSource] = useState('all'),
    [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<MediaAsset | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await adminRequest('/api/media');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Library unavailable.');
      setAssets(result.assets);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (!onClose) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const nodes = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,[tabindex="0"]');
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [onClose]);
  const visible = assets.filter(a => (!imagesOnly || a.mediaType === 'image') && (source === 'all' || a.source === source) && (category === 'all' || a.category === category) && `${a.title} ${a.src} ${a.category}`.toLowerCase().includes(query.toLowerCase()));
  const content = <div ref={panel} tabIndex={-1} role={onClose ? 'dialog' : undefined} aria-modal={onClose ? true : undefined} aria-labelledby="media-library-title" className="bg-white rounded-2xl flex flex-col w-full min-w-0 max-h-[90vh] outline-none shadow-xl">
    <div className="p-5 sm:p-6 border-b flex justify-between items-start gap-4">
      <div><h2 id="media-library-title" className="font-black text-xl text-brand-black">{title}</h2><p className="text-sm text-gray-500 mt-1">{assets.length} assets · Originals and uploads. Backup duplicates are hidden.</p></div>
      {onClose && <button aria-label="Close media library" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>}
    </div>
    <div className="p-5 border-b space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input autoFocus aria-label="Search media" placeholder="Search images, titles or filenames…" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-lg border p-2.5 pl-10 text-sm" /></div>
        <select aria-label="Media source" value={source} onChange={e => setSource(e.target.value)} className="border rounded-lg p-2 text-sm"><option value="all">All sources</option><option value="portfolio">papas26 originals</option><option value="upload">Admin uploads</option></select>
        <select aria-label="Media category" value={category} onChange={e => setCategory(e.target.value)} className="border rounded-lg p-2 text-sm max-w-full"><option value="all">All categories</option>{Array.from(new Set(assets.map(a => a.category))).sort().map(c => <option key={c}>{c}</option>)}</select>
        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg text-sm font-bold cursor-pointer ${busy ? 'opacity-50' : ''}`}><Upload className="w-4 h-4" />{busy ? 'Uploading…' : 'Upload new'}<input aria-label="Upload library media" type="file" className="hidden" disabled={busy} accept={imagesOnly ? 'image/jpeg,image/png,image/webp,image/gif,image/avif' : 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime'} onChange={async e => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setBusy(true);
            setError('');
            try {
              if (file.size > 20 * 1024 * 1024) throw new Error('Maximum upload size is 20 MiB.');
              const src = await uploadMedia(file);
              await load();
              setSelected({
                src,
                title: file.name,
                category: 'Uploads',
                source: 'upload',
                mediaType: file.type.startsWith('video/') ? 'video' : 'image'
              });
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }} /></label>
      </div>
      <p className="text-xs text-gray-500">{onSelect ? 'Select an asset, then confirm. Publish with Save All Changes.' : 'Uploads stay available even when not assigned to a page.'}</p>
    </div>
    <div className="overflow-y-auto min-h-[200px] p-5 flex-1">
      {error && <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-lg mb-4 text-sm">{error} <button onClick={() => void load()} className="underline font-bold">Retry</button></div>}
      {loading ? <p role="status" className="text-gray-500 flex gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Loading media…</p> : <>
        <p className="text-xs text-gray-500 mb-3">{visible.length} results</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">{visible.map(asset => <button key={asset.src} title={asset.src} aria-label={`Select ${asset.title}`} aria-pressed={selected?.src === asset.src} onClick={() => setSelected(asset)} className={`text-left overflow-hidden border-2 rounded-xl focus-visible:outline-brand-cyan ${selected?.src === asset.src ? 'border-brand-cyan bg-sky-50' : 'border-gray-100 hover:border-gray-300'}`}>
          <div className="aspect-[4/3] bg-gray-100 relative">{asset.mediaType === 'image' ? <img src={asset.src} alt={asset.title} loading="lazy" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center"><Film className="w-8 h-8 text-gray-500" /></div>}{currentSrc === asset.src && <span className="absolute top-2 left-2 bg-brand-black text-white rounded px-2 py-1 text-xs">Current</span>}{selected?.src === asset.src && <Check className="absolute right-2 top-2 w-6 h-6 p-1 rounded-full bg-brand-cyan text-white" />}</div>
          <div className="p-3"><p className="font-bold text-xs line-clamp-2">{asset.title}</p><p className="text-[11px] text-gray-500 mt-1 truncate">{asset.category}</p></div>
        </button>)}</div>
        {!visible.length && <p className="py-10 text-center text-gray-500">No matching media. Try another search or upload a file.</p>}
      </>}
    </div>
    <div className="p-5 border-t flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-gray-500 truncate max-w-full">{selected?.title || 'No asset selected'}</span><div className="flex gap-3">{onClose && <button onClick={onClose} className="border px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>}{onSelect && <button disabled={!selected || busy} onClick={() => selected && onSelect(selected)} className="bg-brand-cyan text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-40">Use selected {selected?.mediaType === 'video' ? 'video' : 'image'}</button>}</div></div>
  </div>;
  return onClose ? <div className="fixed inset-0 z-[100] bg-black/60 p-3 sm:p-8 flex items-center justify-center"><div className="w-full max-w-6xl">{content}</div></div> : content;
}
