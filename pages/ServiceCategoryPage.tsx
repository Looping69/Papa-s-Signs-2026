// Author: Klaasvaakie ( |╲ )
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchConfig, ServiceConfig } from '../services/configService';
import { servicesData } from '../data/servicesData';
import { useSiteConfig } from '../components/SiteConfigProvider';
import { 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Store, Shirt, Layout, Printer, Factory, TriangleAlert, Car
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Store, Shirt, Layout, Printer, Factory, TriangleAlert, Car
};

const ServiceCategoryPage: React.FC = () => {
  const {config:publishedConfig}=useSiteConfig();
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const config = await fetchConfig();
        const configService = config.services?.find(s => s.id === categoryId);
        const staticService = servicesData.find(s => s.id === categoryId);
        
        if (configService && staticService) {
          setCategory({
            ...staticService,
            ...configService
          });
        } else if (staticService) {
          setCategory(staticService);
        }
      } catch (error) {
        console.error("Failed to load category", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Category not found</h2>
        <Link to="/services" className="text-brand-cyan font-bold hover:underline">Back to Services</Link>
      </div>
    );
  }

  const handleQuote = (subTitle: string) => {
    navigate(publishedConfig?.quoteAssistant?.enabled===true?'/quote':'/contact', { state: { initialMessage: `${category.title} - ${subTitle}` } });
  };

  const IconComponent = typeof category.icon === 'string' ? (iconMap[category.icon] || Store) : null;

  // Helper to generate some "detail" bullet points based on the sub-service
  const getSubServiceBenefits = (title: string) => {
    const defaultBenefits = [
      "High-durability materials for Northern Cape conditions",
      "Precision color matching to your brand specs",
      "Professional site assessment & installation",
      "UV-resistant inks for long-lasting vibrancy"
    ];
    
    if (title.toLowerCase().includes('mine') || title.toLowerCase().includes('safety')) {
      return [
        "Fully compliant with SABS & Mine Safety standards",
        "High-intensity reflective materials for night visibility",
        "Heavy-duty mounting for industrial environments",
        "Weather-proof and dust-resistant finishes"
      ];
    }
    
    if (title.toLowerCase().includes('clothing') || title.toLowerCase().includes('branding')) {
      return [
        "Premium quality fabrics and vinyls",
        "Wash-resistant printing and embroidery",
        "Fast turnaround on bulk corporate orders",
        "Custom design support included"
      ];
    }

    return defaultBenefits;
  };

  return (
    <div className="pt-20 bg-white">
      {/* Category Hero */}
      <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <img 
          src={category.image} 
          alt={category.title} 
          className="w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <Link to="/services" className="inline-flex items-center text-white/70 hover:text-white mb-6 text-sm font-bold uppercase tracking-widest group">
              <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-brand-cyan transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Back to Services
            </Link>
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-brand-cyan p-3 rounded-2xl shadow-xl animate-scale-in">
                  {IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : (React.isValidElement(category.icon) && React.cloneElement(category.icon as React.ReactElement<any>, { className: "w-8 h-8 text-white" }))}
               </div>
               <span className="text-brand-yellow font-bold tracking-[0.3em] uppercase text-sm animate-fade-in delay-1">Premium Solutions</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none animate-fade-in delay-2">{category.title}</h1>
            <p className="text-gray-300 mt-6 max-w-2xl text-lg md:text-xl font-light leading-relaxed animate-fade-in delay-3">
              {category.description} Specialized for Kuruman and the greater Northern Cape mining and retail sectors.
            </p>
            
            {/* Category Quick Facts */}
            <div className="flex flex-wrap gap-6 mt-10 opacity-0 animate-fade-in delay-4">
              {category.turnaround && (
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Avg. Turnaround</p>
                    <p className="text-sm text-white font-bold">{category.turnaround}</p>
                  </div>
                </div>
              )}
              {category.usp && (
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-magenta/20 flex items-center justify-center text-brand-magenta">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Our Edge</p>
                    <p className="text-sm text-white font-bold">{category.usp}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Services Detailed View */}
      <section className="py-24 space-y-32 overflow-hidden">
        {category.subServices.map((sub, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div key={sub.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}>
                
                {/* Visual Image Block */}
                <div className={`w-full lg:w-1/2 opacity-0 animate-scale-in delay-${(idx % 5) + 1}`}>
                  <div className="relative group/image">
                    {/* Decorative Elements */}
                    <div className={`absolute -top-10 ${isEven ? '-left-10' : '-right-10'} w-40 h-40 ${isEven ? 'bg-brand-cyan/10' : 'bg-brand-magenta/10'} rounded-full blur-3xl animate-float`}></div>
                    
                    <div className="relative z-10 overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100">
                      <img 
                        src={publishedConfig?.images?.[`sub-${category.id}-${sub.id}`]||sub.image || category.image}
                        alt={sub.title} 
                        loading="lazy"
                        className="w-full h-full aspect-[4/3] object-cover group-hover/image:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                         <div className={`p-3 rounded-xl shadow-lg ${isEven ? 'bg-brand-cyan' : 'bg-brand-magenta'} text-white`}>
                            {sub.icon ? React.cloneElement(sub.icon as React.ReactElement<any>, { className: "w-6 h-6" }) : <Sparkles className="w-6 h-6" />}
                         </div>
                         <span className="text-white font-bold text-lg drop-shadow-md">{sub.title}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Block */}
                <div className={`w-full lg:w-1/2 opacity-0 animate-fade-in delay-${(idx % 5) + 2}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-brand-cyan font-black text-4xl opacity-20">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div className="h-[2px] w-12 bg-gray-200"></div>
                  </div>
                  <h3 className="text-4xl font-black text-brand-black mb-6 leading-tight">
                    Expert {sub.title} <br/>
                    <span className={isEven ? 'text-brand-cyan' : 'text-brand-magenta'}>for your business</span>
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8">
                    {sub.description}. Our Kuruman facility ensures every piece is manufactured to the highest standards, utilizing industrial-grade materials suited for indoor and outdoor environments.
                  </p>
                  
                  {/* Benefits & Details List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {/* Materials */}
                    {sub.materials && sub.materials.length > 0 && (
                      <div className="col-span-1 sm:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-widest mb-2">Materials</h4>
                        <div className="flex flex-wrap gap-2">
                          {sub.materials.map((m, mi) => (
                            <span key={mi} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Turnaround */}
                    {sub.turnaround && (
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isEven ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-brand-magenta/10 text-brand-magenta'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turnaround</h4>
                          <p className="text-sm font-bold text-gray-700">{sub.turnaround}</p>
                        </div>
                      </div>
                    )}

                    {/* USP */}
                    {sub.usp && (
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isEven ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-brand-magenta/10 text-brand-magenta'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unique Value</h4>
                          <p className="text-sm font-bold text-gray-700">{sub.usp}</p>
                        </div>
                      </div>
                    )}

                    {/* Fallback Benefits if no specific fields */}
                    {(!sub.materials && !sub.turnaround && !sub.usp) && getSubServiceBenefits(sub.title).map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isEven ? 'text-brand-cyan' : 'text-brand-magenta'}`} />
                        <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => handleQuote(sub.title)}
                      className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl ${isEven ? 'bg-brand-cyan shadow-brand-cyan/20 hover:bg-brand-black' : 'bg-brand-magenta shadow-brand-magenta/20 hover:bg-brand-black'}`}
                    >
                      Request a Quote <ArrowRight className="w-5 h-5" />
                    </button>
                    <Link 
                      to="/gallery" 
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-brand-black border-2 border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      View Portfolio
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </section>

      {/* Bottom Conversion Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white rounded-[3rem] p-8 md:p-20 shadow-2xl border border-gray-100 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-cyan/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-brand-magenta/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-block p-4 bg-brand-yellow/10 rounded-3xl mb-8">
                <Sparkles className="w-10 h-10 text-brand-yellow" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-black mb-6">Need a custom {category.title} package?</h2>
              <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
                Every project is unique. Our specialists in Kuruman can provide on-site measurements and custom material recommendations tailored to your specific budget and timeline.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <Link 
                  to={publishedConfig?.quoteAssistant?.enabled===true?'/quote':'/contact'}
                  state={{ initialMessage: category.title }}
                  className="w-full md:w-auto bg-brand-black text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-cyan transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle className="w-6 h-6" /> {publishedConfig?.quoteAssistant?.enabled===true?"Chat with Papa's Bot":"Request a staff quote"}
                </Link>
                <Link 
                  to="/contact" 
                  className="w-full md:w-auto bg-brand-magenta text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-black transition-all flex items-center justify-center gap-3"
                >
                  Contact Our Office
                </Link>
              </div>
              <p className="mt-8 text-xs text-gray-400 font-bold uppercase tracking-widest">Available Mon-Fri 08:00 – 17:00 • Kuruman, Northern Cape</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceCategoryPage;
