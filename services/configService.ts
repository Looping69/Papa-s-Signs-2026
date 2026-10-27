import type { QuoteSettings } from '../shared/quote';
export interface HeroConfig {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
}

export interface StatConfig {
  id: string;
  title: string;
  label: string;
}

export interface GalleryImage {
  src: string;
  title: string;
  category: string;
  featured?: boolean;
  mediaType?: "image" | "video";
}

export interface ServiceConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

export interface SiteConfig {
  _revision?: number;
  hero: HeroConfig;
  stats: StatConfig[];
  gallery: GalleryImage[];
  services: ServiceConfig[];
  images?: Record<string, string>;
  quoteAssistant?: QuoteSettings;
}

export const fetchConfig = async (): Promise<SiteConfig> => {
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error("Failed to fetch config");
  }
  return response.json();
};

export const adminRequest=async(url:string,init?:RequestInit):Promise<Response>=>{
  const response=await fetch(url,{...init,credentials:'same-origin'});
  if(response.status===401)window.dispatchEvent(new Event('admin-session-expired'));
  return response;
};
export const fetchAdminConfig=async():Promise<SiteConfig>=>{
  const response=await adminRequest('/api/admin/config');
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Unable to load admin settings.');}
  return response.json();
};

export const saveConfig = async (config: SiteConfig): Promise<number | undefined> => {
  const response = await adminRequest("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to save config");
  }
  const saved = await response.json();
  window.dispatchEvent(new Event('site-config-saved'));
  return typeof saved.revision === 'number' ? saved.revision : undefined;
};

export const uploadMedia = async (file: File): Promise<string> => {
  const mode = await adminRequest('/api/media/upload-mode');
  const provider = mode.ok ? (await mode.json()).provider : undefined;
  if (mode.ok && provider === 'blob') {
    if (file.size > 20 * 1024 * 1024) throw new Error('Media must be at most 20 MiB.');
    const { upload } = await import('@vercel/blob/client');
    const filename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '-').replace(/\.(?=.*\.)/g, '-').slice(-120);
    const blob = await upload(`uploads/${crypto.randomUUID()}-${filename}`, file, {access:'public',handleUploadUrl:'/api/upload',contentType:file.type});
    return blob.url;
  }
  if ((!mode.ok && mode.status !== 404) || (mode.ok && provider !== 'local')) throw new Error('Please sign in before uploading.');
  const formData = new FormData();
  formData.append("image", file);

  const response = await adminRequest("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to upload media");
  }

  const data = await response.json();
  return data.url;
};

export const uploadImage = uploadMedia;
