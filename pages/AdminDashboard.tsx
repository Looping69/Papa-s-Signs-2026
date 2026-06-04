import React, { useState, useEffect } from "react";
import { fetchConfig, saveConfig, uploadMedia, SiteConfig, GalleryImage, ServiceConfig } from "../services/configService";
import { 
  Save, Upload, Plus, Trash2, CheckCircle, AlertCircle, 
  Image as ImageIcon, Layout, Settings, Grid, FileText, 
  ChevronRight, Home, Briefcase, Info, Phone, ArrowLeft
} from "lucide-react";

type Tab = "overview" | "media" | "gallery" | "services";

const VIDEO_FILE_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

const getGalleryMediaType = (item: GalleryImage): "image" | "video" =>
  item.mediaType === "video" || VIDEO_FILE_PATTERN.test(item.src) ? "video" : "image";

const AdminDashboard: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchConfig();
        setConfig(data);
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load configuration." });
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!config) return;
    const { name, value } = e.target;
    setConfig({
      ...config,
      hero: {
        ...config.hero,
        [name]: value,
      },
    });
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    if (!config) return;
    const newStats = [...config.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setConfig({ ...config, stats: newStats });
  };

  const handleGalleryChange = (index: number, field: keyof GalleryImage, value: any) => {
    if (!config) return;
    const newGallery = [...config.gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    setConfig({ ...config, gallery: newGallery });
  };

  const handleServiceChange = (index: number, field: keyof ServiceConfig, value: string) => {
    if (!config) return;
    const newServices = [...config.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setConfig({ ...config, services: newServices });
  };

  const addGalleryItem = () => {
    if (!config) return;
    const newItem: GalleryImage = {
      src: "",
      title: "",
      category: "Retail",
      featured: false,
      mediaType: "image"
    };
    setConfig({ ...config, gallery: [...config.gallery, newItem] });
  };

  const removeGalleryItem = (index: number) => {
    if (!config) return;
    const newGallery = config.gallery.filter((_, i) => i !== index);
    setConfig({ ...config, gallery: newGallery });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: any) => {
    if (!config || !e.target.files?.[0]) return;
    try {
      setSaving(true);
      const file = e.target.files[0];
      const url = await uploadMedia(file);
      const galleryMediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      
      if (target === "hero") {
        setConfig({
          ...config,
          hero: { ...config.hero, backgroundImage: url },
        });
      } else if (target.type === "gallery") {
        const newGallery = [...config.gallery];
        newGallery[target.index] = { ...newGallery[target.index], src: url, mediaType: galleryMediaType };
        setConfig({ ...config, gallery: newGallery });
      } else if (target.type === "service") {
        const newServices = [...config.services];
        newServices[target.index] = { ...newServices[target.index], image: url };
        setConfig({ ...config, services: newServices });
      }
      
      setMessage({ type: "success", text: "Media uploaded successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload media." });
    } finally {
      setSaving(false);
    }
  };

  const renderGalleryMediaPreview = (item: GalleryImage, className: string) => (
    getGalleryMediaType(item) === "video" ? (
      <video
        src={item.src}
        className={className}
        controls
        preload="metadata"
      />
    ) : (
      <img src={item.src} alt={item.title || "Gallery item"} className={className} />
    )
  );

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      await saveConfig(config);
      setMessage({ type: "success", text: "Configuration saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save configuration." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan"></div>
      </div>
    );
  }

  const SidebarItem = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        activeTab === id 
          ? "bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20" 
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const renderMediaTab = () => {
    const pages = [
      { id: "home", label: "Home Page", icon: Home },
      ... (config?.services || []).map(s => ({ id: s.id, label: s.title, icon: Briefcase }))
    ];

    const activeSelection = pages.find(p => p.id === selectedPage);
    
    return (
      <div className="flex gap-8 h-full">
        {/* Sub-sidebar for pages */}
        <div className="w-64 flex-shrink-0 space-y-2 border-r pr-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Select Page/Service</h3>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedPage === page.id 
                  ? "bg-brand-black text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <page.icon className="w-4 h-4" />
                {page.label}
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedPage === page.id ? "rotate-90" : ""}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <h3 className="text-xl font-black text-brand-black mb-6">Active Media: {activeSelection?.label}</h3>
          
          <div className="space-y-6">
            {selectedPage === "home" ? (
              <>
                {/* Home Hero */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center gap-6">
                  <div className="w-40 h-24 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-200 flex-shrink-0">
                    <img src={config?.hero?.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">Hero Background</h4>
                    <p className="text-xs text-gray-500 mb-4">Main landing page background image</p>
                    <label className="inline-flex items-center gap-2 bg-white text-brand-black px-4 py-2 rounded-lg text-xs font-black border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                      <Upload className="w-3 h-3" />
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "hero")} />
                    </label>
                  </div>
                </div>

                {/* Home Gallery */}
                <div className="grid grid-cols-1 gap-4">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Gallery Media</h4>
                  {(config?.gallery || []).map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-6">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-gray-200 flex-shrink-0">
                        {item.src ? (
                          renderGalleryMediaPreview(item, "w-full h-full object-cover")
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-2">
                            Upload media
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">{item.title || "Untitled project"}</h4>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{item.category}</p>
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 bg-white text-brand-black px-3 py-1.5 rounded-lg text-[10px] font-black border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                            <Upload className="w-3 h-3" />
                            Replace Media
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, { type: "gallery", index: idx })} />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Service Specific Images */
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center gap-6">
                {(() => {
                  const serviceIndex = config?.services.findIndex(s => s.id === selectedPage);
                  const service = config?.services[serviceIndex!];
                  if (!service) return null;
                  return (
                    <>
                      <div className="w-48 h-32 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-200 flex-shrink-0">
                        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">Main Service Image</h4>
                        <p className="text-xs text-gray-500 mb-4">Displayed on the services list and detail page</p>
                        <label className="inline-flex items-center gap-2 bg-white text-brand-black px-4 py-2 rounded-lg text-xs font-black border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all">
                          <Upload className="w-3 h-3" />
                          Change Image
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, { type: "service", index: serviceIndex })} />
                        </label>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-brand-black">PAPA'S ADMIN</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content Management System</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <SidebarItem id="overview" label="Overview" icon={Layout} />
          <SidebarItem id="media" label="Media & Pages" icon={ImageIcon} />
          <SidebarItem id="gallery" label="Gallery" icon={Grid} />
          <SidebarItem id="services" label="Services" icon={Briefcase} />
          
          <div className="pt-8">
            <a 
              href="/" 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-400 hover:text-brand-cyan transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Website
            </a>
          </div>
        </nav>

        <div className="p-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-brand-black text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-magenta transition-all disabled:opacity-50 shadow-xl shadow-brand-black/20"
          >
            {saving ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <Save className="w-5 h-5" />}
            Save All Changes
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        {message && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{message.text}</span>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-brand-black mb-8 border-b pb-6">Hero Section</h2>
                <div className="grid grid-cols-1 gap-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Main Title</label>
                      <input
                        type="text"
                        name="title"
                        value={config?.hero?.title || ""}
                        onChange={handleHeroChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-cyan outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Subtitle (Gradient)</label>
                      <input
                        type="text"
                        name="subtitle"
                        value={config?.hero?.subtitle || ""}
                        onChange={handleHeroChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-cyan outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description</label>
                    <textarea
                      name="description"
                      value={config?.hero?.description || ""}
                      onChange={handleHeroChange}
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-cyan outline-none font-medium text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-brand-black mb-8 border-b pb-6">Floating Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(config?.stats || []).map((stat, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
                          <input
                            type="text"
                            value={stat.title}
                            onChange={(e) => handleStatChange(index, "title", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-brand-cyan outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => handleStatChange(index, "label", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-brand-cyan outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 min-h-[600px] animate-fade-in">
              {renderMediaTab()}
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 animate-fade-in">
              <div className="flex items-center justify-between mb-8 border-b pb-6">
                <h2 className="text-2xl font-black text-brand-black">Gallery Management</h2>
                <button
                  onClick={addGalleryItem}
                  className="flex items-center gap-2 bg-brand-cyan text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-magenta transition-all shadow-lg shadow-brand-cyan/20"
                >
                  <Plus className="w-5 h-5" />
                  Add Project
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(config?.gallery || []).map((item, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                    <button
                      onClick={() => removeGalleryItem(index)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-6">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-gray-200 flex-shrink-0 relative">
                        {item.src ? (
                          renderGalleryMediaPreview(item, "w-full h-full object-cover")
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-2">
                            Upload media
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload className="w-6 h-6 text-white" />
                          <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, { type: "gallery", index })} />
                        </label>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Project Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleGalleryChange(index, "title", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-brand-cyan outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                            <select
                              value={item.category}
                              onChange={(e) => handleGalleryChange(index, "category", e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-brand-cyan outline-none"
                            >
                              <option value="Mining & Safety">Mining & Safety</option>
                              <option value="Branding">Branding</option>
                              <option value="Retail">Retail</option>
                              <option value="Digital Print">Digital Print</option>
                              <option value="Clothing">Clothing</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Media Type</label>
                            <div className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-600">
                              {getGalleryMediaType(item)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-6">
                            <input
                              type="checkbox"
                              id={`featured-${index}`}
                              checked={item.featured}
                              onChange={(e) => handleGalleryChange(index, "featured", e.target.checked)}
                              className="w-5 h-5 text-brand-cyan rounded-lg focus:ring-brand-cyan border-gray-300"
                            />
                            <label htmlFor={`featured-${index}`} className="text-xs font-black text-gray-600">Featured</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 animate-fade-in">
              <h2 className="text-2xl font-black text-brand-black mb-8 border-b pb-6">Services Management</h2>
              <div className="space-y-8">
                {(config?.services || []).map((service, index) => (
                  <div key={index} className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Service Image</label>
                        <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-200 group">
                          <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="w-8 h-8 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, { type: "service", index })} />
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Service Title</label>
                            <input
                              type="text"
                              value={service.title}
                              onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold focus:ring-2 focus:ring-brand-cyan outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Icon Name (Lucide)</label>
                            <input
                              type="text"
                              value={service.icon}
                              onChange={(e) => handleServiceChange(index, "icon", e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold focus:ring-2 focus:ring-brand-cyan outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 font-medium text-gray-600 focus:ring-2 focus:ring-brand-cyan outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
