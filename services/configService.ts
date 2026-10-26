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
}

export const fetchConfig = async (): Promise<SiteConfig> => {
  const response = await fetch("/api/config");
  if (!response.ok) {
    throw new Error("Failed to fetch config");
  }
  return response.json();
};

export const saveConfig = async (config: SiteConfig): Promise<void> => {
  const response = await fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error("Failed to save config");
  }
};

export const uploadMedia = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload media");
  }

  const data = await response.json();
  return data.url;
};

export const uploadImage = uploadMedia;
