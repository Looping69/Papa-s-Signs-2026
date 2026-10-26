// Author: Klaasvaakie ( |╲ )
import React from 'react';
import SchemaMarkup from '../components/SchemaMarkup';
import { papas26Asset, siteImages as defaultImages } from '../data/papas26Assets';
import { useSiteConfig } from '../components/SiteConfigProvider';
import { 
  Users, 
  History, 
  Target, 
  Heart, 
  ShieldCheck, 
  HardHat, 
  Globe, 
  Award,
  CheckCircle2
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const {config}=useSiteConfig();
  const siteImages={...defaultImages,...config?.images};
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Papa's Signs",
    "description": "Learn about the legacy of Papa's Signs in Kuruman, providing over 15 years of signage and branding excellence.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Papa's Signs",
      "foundingDate": "2009",
      "areaServed": "Kuruman, Northern Cape",
      "knowsAbout": ["Signage", "Digital Printing", "Mine Safety Signs", "Vehicle Branding"]
    }
  };

  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-cyan" />,
      title: "Uncompromising Quality",
      desc: "We use only premium materials and UV-resistant inks designed to survive the harsh Northern Cape climate."
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-brand-magenta" />,
      title: "Reliability",
      desc: "Our clients in mining and construction rely on our speed. We deliver when we say we will, every time."
    },
    {
      icon: <Award className="w-8 h-8 text-brand-yellow" />,
      title: "Innovation",
      desc: "From 3D illuminated signs to the latest large-format technology, we stay ahead of industry trends."
    },
    {
      icon: <Heart className="w-8 h-8 text-brand-cyan" />,
      title: "Community Focus",
      desc: "Kuruman is our home. We are committed to local development and providing world-class service to our neighbors."
    }
  ];

  return (
    <div className="pt-20 animate-fade-in">
      <SchemaMarkup data={aboutSchema} />
      {/* Hero Section */}
      <section className="relative py-24 bg-brand-dark overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={siteImages.aboutHero}
            className="w-full h-full object-cover" 
            alt="Workshop background" 
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-brand-cyan font-bold tracking-widest uppercase mb-4">Our Legacy</h1>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">More Than Just Signs.<br/><span className="text-brand-magenta">We Build Brands.</span></h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            For over 15 years, Papa's Signs has been the pulse of visual communication in Kuruman, delivering end-to-end signage and branding solutions for the Northern Cape's most demanding industries.
          </p>
        </div>
      </section>

      {/* Story & Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-brand-cyan font-bold text-sm mb-6">
                <History className="w-4 h-4" /> OUR STORY
              </div>
              <h3 className="text-4xl font-black text-brand-black mb-6">Built from the Ground Up in Kuruman</h3>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Papa's Signs started with a simple vision: to provide Kuruman and its surrounding areas with high-quality, professional printing services that were previously only available in major cities.
              </p>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                As the mining and construction sectors in the region grew, so did we. We specialized in mine-compliant safety signage, high-visibility vehicle decals, and large-format site branding. Today, we operate from our newly built, state-of-the-art facility, equipped to handle any project from a single business card to massive billboard installations.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[99, 119, 120, 128].map(projectNumber => (
                    <div key={projectNumber} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                      <img src={config?.images?.[`about-team-${projectNumber}`]||papas26Asset(projectNumber)} alt={`Papa's Signs project ${projectNumber}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-brand-black">Built by Our Local Team</p>
                  <p className="text-sm text-gray-500">Real work delivered from Kuruman</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src={siteImages.production}
                alt="Papa's Signs team producing custom dimensional lettering"
                loading="lazy"
                className="rounded-3xl shadow-lg w-full h-64 object-cover"
              />
              <img 
                src={siteImages.installation}
                alt="Completed retail storefront branding installation"
                loading="lazy"
                className="rounded-3xl shadow-lg w-full h-64 object-cover mt-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Focus: Mining & Construction */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-black rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-magenta/5 skew-x-12 translate-x-24"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <HardHat className="w-12 h-12 text-brand-yellow" />
                <h3 className="text-3xl md:text-5xl font-black text-white">The Mining Hub Specialist</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white">
                <div>
                  <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    Situated in the heart of the Northern Cape mining belt, we understand the rigorous safety requirements of the industry. We produce signage that meets and exceeds national safety standards.
                  </p>
                  <ul className="space-y-4">
                    {['SABS Standard Safety Signs', 'High-Intensity Reflective Tapes', 'Mining Vehicle Branding (Chevron/Decals)', 'Site Informational & Directional Boards'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 font-semibold">
                        <CheckCircle2 className="w-5 h-5 text-brand-cyan" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <h4 className="text-brand-yellow font-bold uppercase tracking-widest text-sm mb-4">Quality Assurance</h4>
                  <p className="text-gray-300 italic">
                    "Our workshop uses the latest UV printing technology, ensuring your safety signs remain legible and vibrant even after years of exposure to the Kuruman sun and dust."
                  </p>
                  <p className="mt-4 font-bold text-white">— Production Lead, Papa's Signs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-brand-cyan font-bold tracking-widest uppercase mb-4">Our Principles</h3>
            <h2 className="text-4xl font-black text-brand-black">The Values That Drive Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-brand-cyan/30 hover:shadow-xl transition-all group">
                <div className="mb-6 group-hover:scale-110 transition-transform">{v.icon}</div>
                <h4 className="text-xl font-bold text-brand-black mb-3">{v.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-cyan relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <Globe className="absolute -bottom-20 -right-20 w-96 h-96 text-white" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to partner with Kuruman's best?</h2>
          <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto">
            Whether you're a startup needing a logo or a mine requiring full site compliance, our team is standing by.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={config?.quoteAssistant?.enabled===true?'/#/quote':'/#/contact'}
              className="bg-brand-black px-10 py-5 rounded-2xl font-bold text-lg hover:bg-brand-magenta transition-all"
            >
              Get a Quote Now
            </a>
            <a 
              href="/#/contact" 
              className="bg-white text-brand-cyan px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all"
            >
              Contact Our Office
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
