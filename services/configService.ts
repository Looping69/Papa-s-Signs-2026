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

export const saveConfig = async (config: SiteConfig): Promise<void> => {
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
  window.dispatchEvent(new Event('site-config-saved'));
};

export const uploadMedia = async (file: File): Promise<string> => {
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
