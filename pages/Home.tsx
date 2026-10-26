// Author: Klaasvaakie ( |╲ )
import React from 'react';
import { motion } from 'motion/react';
import Hero from '../components/Hero';
import SchemaMarkup from '../components/SchemaMarkup';
import { 
  ShieldCheck, 
  MapPin, 
  BadgeCheck, 
  Clock, 
  ArrowRight, 
  Settings, 
  PenTool, 
  Truck, 
  Zap,
  HardHat,
  Building2,
  ShoppingBag,
  Maximize,
  Star,
  Quote,
  Target,
  Users,
  Award,
  CheckCircle2,
  Layers,
  Sparkles,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteImages as defaultImages } from '../data/papas26Assets';
import { useSiteConfig } from '../components/SiteConfigProvider';

const Home: React.FC = () => {
  const {config}=useSiteConfig();
  const siteImages={...defaultImages,...config?.images};
  const businessSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "name": "Papa's Signs",
        "description": "Kuruman's premier signage and printing specialists. Delivering excellence to the mining, construction, and retail sectors for over 15 years.",
        "image": `${window.location.origin}${siteImages.hero}`,
        "telephone": "+27 53 712 3954",
        "email": "sales@papassigns.co.za",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Corner Lantana & Lilac Street",
          "addressLocality": "Kuruman",
          "postalCode": "8460",
          "addressCountry": "ZA"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "08:00",
          "closes": "17:00"
        },
        "url": window.location.origin,
        "priceRange": "$$"
      },
      {
        "@type": "WebSite",
        "url": window.location.origin,
        "name": "Papa's Signs",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/services?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  const testimonials = [
    {
      name: "Johan Steyn",
      role: "Safety Officer",
      company: "Northern Cape Mining Group",
      text: "Papa's Signs is our go-to for all mine safety signage. Their understanding of SABS compliance and the durability of their materials in the Kuruman dust is unmatched.",
      stars: 5
    },
    {
      name: "Sarah Mokoena",
      role: "Business Owner",
      company: "Lumina Boutique",
      text: "The 3D illuminated shopfront signs they created for us transformed our store's presence. Professional, creative, and fast. Highly recommended for retail branding.",
      stars: 5
    },
    {
      name: "David Venter",
      role: "Project Manager",
      company: "KGM Construction",
      text: "From massive site hoardings to vehicle decals for our entire fleet, Papa's Signs delivers quality that lasts. Their new premises are impressive and their service is top-notch.",
      stars: 5
    }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="overflow-x-hidden bg-white">
      <SchemaMarkup data={businessSchema} />
      <Hero />
      
      {/* About Section - "Saying a lot about them" */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-brand-cyan/10 text-brand-cyan px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
                <Target className="w-4 h-4" />
                Our Legacy
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-brand-black mb-8 leading-tight">
                Crafting <span className="text-brand-magenta">Excellence</span> <br/>
                Since Day One
              </h2>
              <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                For over 15 years, Papa's Signs has been the heartbeat of visual communication in Kuruman. We aren't just printers; we are architects of brand identity and guardians of safety.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-cyan/20 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-brand-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-black">Client-Centric</h4>
                    <p className="text-gray-500 text-sm">We build relationships, not just signs.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-brand-magenta/20 p-3 rounded-xl">
                    <Award className="w-6 h-6 text-brand-magenta" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-black">Quality First</h4>
                    <p className="text-gray-500 text-sm">SABS compliant and mine-ready materials.</p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-brand-cyan font-bold hover:text-brand-magenta transition-colors group">
                Read Our Full Story <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 grid grid-cols-2 gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <img src={siteImages.workshop} alt="Papa's Signs workshop team producing custom dimensional signage" loading="lazy" className="rounded-3xl shadow-xl w-full h-64 object-cover" />
                <div className="bg-brand-dark p-8 rounded-3xl text-white">
                  <div className="text-4xl font-black mb-2">15+</div>
                  <div className="text-brand-cyan font-bold text-xs uppercase tracking-widest">Years of Mastery</div>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="bg-brand-magenta p-8 rounded-3xl text-white">
                  <div className="text-4xl font-black mb-2">5k+</div>
                  <div className="text-white/80 font-bold text-xs uppercase tracking-widest">Projects Delivered</div>
                </div>
                <img src={siteImages.signatureSign} alt="Illuminated signage manufactured by Papa's Signs" loading="lazy" className="rounded-3xl shadow-xl w-full h-64 object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Large Format Showcase - "Showing a lot about them" */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            {...fadeIn}
          >
            <h2 className="text-brand-cyan font-bold tracking-widest uppercase mb-4 text-sm">Industrial Scale</h2>
            <h3 className="text-4xl md:text-6xl font-black text-brand-black">Large Format Showcase</h3>
            <p className="text-gray-500 max-w-2xl mx-auto mt-6 text-lg">
              Our facility houses the most advanced wide-format technology in the Northern Cape, capable of producing stunning graphics at any scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div 
              className="lg:col-span-7 relative group overflow-hidden rounded-[2.5rem] shadow-2xl h-[500px]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src={siteImages.largeFormat}
                alt="Large-format mine safety notice board produced by Papa's Signs"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                <div className="bg-brand-cyan w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Maximize className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-3xl font-black text-white mb-2">Billboards & Wraps</h4>
                <p className="text-gray-300 max-w-md">Seamless printing up to 3.2m width on PVC, Mesh, and Vinyl.</p>
              </div>
            </motion.div>

            <div className="lg:col-span-5 flex flex-col gap-8">
              <motion.div 
                className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex-grow"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 bg-brand-magenta/10 rounded-2xl flex items-center justify-center mb-6 text-brand-magenta">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-brand-black mb-4">UV-Resistant Inks</h4>
                <p className="text-gray-500 leading-relaxed">
                  Specially formulated inks that withstand the harsh Northern Cape sun without fading, ensuring your brand stays vibrant for years.
                </p>
              </motion.div>
              <motion.div 
                className="bg-brand-dark p-10 rounded-[2.5rem] shadow-xl text-white flex-grow"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-brand-cyan/20 rounded-2xl flex items-center justify-center mb-6 text-brand-cyan">
                  <Monitor className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black mb-4">Precision Plotting</h4>
                <p className="text-gray-400 leading-relaxed">
                  Computer-controlled cutting for intricate decals, vehicle wraps, and 3D lettering with micron-level accuracy.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors We Specialize In */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            {...fadeIn}
          >
            <h2 className="text-brand-magenta font-bold tracking-widest uppercase mb-4 text-sm">Our Reach</h2>
            <h3 className="text-4xl md:text-5xl font-black text-brand-black">Sectors We Specialize In</h3>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {[
              { 
                icon: <HardHat className="w-10 h-10" />, 
                title: "Mining & Industrial", 
                desc: "Specialized safety signage, reflective vehicle decals, and heavy-duty site boards compliant with national mine safety standards.",
                color: "bg-brand-yellow/10 text-brand-yellow",
                image: siteImages.mining
              },
              { 
                icon: <Building2 className="w-10 h-10" />, 
                title: "Corporate & Office", 
                desc: "Professional indoor branding, sandblasted window films, 3D reception signs, and corporate identity stationery.",
                color: "bg-brand-cyan/10 text-brand-cyan",
                image: siteImages.corporate
              },
              { 
                icon: <ShoppingBag className="w-10 h-10" />, 
                title: "Retail & Promotion", 
                desc: "Vibrant shopfronts, lightboxes, pull-up banners, and promotional gifts designed to catch eyes and drive sales.",
                color: "bg-brand-magenta/10 text-brand-magenta",
                image: siteImages.retail
              }
            ].map((v, i) => (
              <motion.div 
                key={i} 
                className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                variants={fadeIn}
              >
                <div className="h-48 overflow-hidden">
                  <img src={v.image} alt={v.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-10">
                  <div className={`${v.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                    {v.icon}
                  </div>
                  <h4 className="text-2xl font-bold text-brand-black mb-4">{v.title}</h4>
                  <p className="text-gray-500 leading-relaxed mb-8">{v.desc}</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 font-bold text-brand-black hover:text-brand-cyan transition-colors">
                    Explore Sector <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Papa's Signs Process */}
      <section className="py-24 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-cyan/5 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-24"
            {...fadeIn}
          >
            <h2 className="text-brand-cyan font-bold tracking-widest uppercase mb-4 text-sm">Workflow</h2>
            <h3 className="text-4xl md:text-5xl font-black">The Papa's Signs Process</h3>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { icon: <PenTool />, step: "01", title: "Consult & Design", desc: "We sit with you to understand your brand and create custom mockups." },
                { icon: <Settings />, step: "02", title: "Fabrication", desc: "Our workshop builds frames, boards, and structures from scratch." },
                { icon: <BadgeCheck />, step: "03", title: "Precision Print", desc: "High-resolution digital printing with long-lasting UV inks." },
                { icon: <Truck />, step: "04", title: "Delivery & Install", desc: "Professional installation teams ensure a perfect finish on site." }
              ].map((p, i) => (
                <motion.div 
                  key={i} 
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <div className="w-24 h-24 bg-brand-cyan rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,174,239,0.3)] relative z-10 group hover:rotate-6 transition-transform">
                    {React.isValidElement(p.icon) && React.cloneElement(p.icon as React.ReactElement<any>, { className: "w-10 h-10 text-white" })}
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-brand-magenta rounded-full flex items-center justify-center text-white font-black text-sm border-4 border-brand-dark">
                      {p.step}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{p.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical Trust Stats */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { val: "15+", label: "Years Experience", icon: <Clock className="w-6 h-6" /> },
              { val: "100%", label: "Mine Compliant", icon: <ShieldCheck className="w-6 h-6" /> },
              { val: "24hr", label: "Fastest Turnaround", icon: <Zap className="w-6 h-6" /> },
              { val: "5k+", label: "Projects Completed", icon: <CheckCircle2 className="w-6 h-6" /> }
            ].map((s, i) => (
              <motion.div 
                key={i} 
                className="text-center p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-brand-cyan mb-4 flex justify-center">{s.icon}</div>
                <div className="text-5xl font-black text-brand-black mb-2">{s.val}</div>
                <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-20"
            {...fadeIn}
          >
            <h2 className="text-brand-cyan font-bold tracking-widest uppercase mb-4 text-sm">Client Trust</h2>
            <h3 className="text-4xl md:text-5xl font-black text-brand-black mb-6">Built on Satisfaction</h3>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i} 
                className="bg-white p-10 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(t.stars)].map((_, si) => (
                    <Star key={si} className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <div className="relative mb-8">
                  <Quote className="absolute -top-4 -left-4 w-12 h-12 text-brand-cyan/10" />
                  <p className="text-gray-700 italic text-lg leading-relaxed relative z-10">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 border-t border-gray-100 pt-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${i === 0 ? 'bg-brand-cyan' : i === 1 ? 'bg-brand-magenta' : 'bg-brand-yellow text-brand-black'}`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-black leading-none">{t.name}</h4>
                    <p className="text-xs text-brand-cyan font-bold uppercase tracking-widest mt-1">{t.role}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={siteImages.cta}
            alt="CTA Background" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-block p-4 bg-brand-magenta/10 rounded-full mb-8">
              <Sparkles className="w-12 h-12 text-brand-magenta" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-brand-black mb-8">Ready to Brand Your Future?</h2>
            <p className="text-gray-600 text-xl mb-12 leading-relaxed">
              From the smallest label to the largest billboard, Papa's Signs delivers quality that lasts. Start your journey with Kuruman's most trusted printing house today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to={config?.quoteAssistant?.enabled===true?'/quote':'/contact'}
                className="w-full sm:w-auto bg-brand-cyan text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-brand-magenta transition-all shadow-2xl shadow-brand-cyan/30 flex items-center justify-center gap-3 active:scale-95"
              >
                {config?.quoteAssistant?.enabled===true?'Start Smart Quote':'Request a Staff Quote'} <ArrowRight className="w-6 h-6" />
              </Link>
              <Link 
                to="/gallery" 
                className="w-full sm:w-auto bg-white border-2 border-gray-200 text-brand-black px-12 py-6 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                View Portfolio
              </Link>
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale">
              <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> SABS Compliant</div>
              <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest"><Layers className="w-4 h-4" /> Premium Materials</div>
              <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest"><Award className="w-4 h-4" /> Expert Installers</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
