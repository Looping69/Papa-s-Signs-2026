import React from 'react';
import { useSiteConfig } from './SiteConfigProvider';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const {config}=useSiteConfig();
  return (
    <footer className="bg-black text-gray-500 pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-1">
             <span className="font-extrabold text-2xl tracking-tight text-white block mb-4">PAPA'S SIGNS</span>
             <p className="text-sm leading-relaxed mb-6">
               Kuruman's premier signage and printing specialists. Delivering excellence to the mining, construction, and retail sectors for over 15 years.
             </p>
             <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cyan hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-magenta hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-yellow hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-brand-cyan transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-cyan transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-brand-cyan transition-colors">Services</Link></li>
              <li><Link to="/gallery" className="hover:text-brand-cyan transition-colors">Project Gallery</Link></li>
              {config?.quoteAssistant?.enabled===true&&<li><Link to="/quote" className="hover:text-brand-cyan transition-colors">Request a Quote</Link></li>}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Services</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/services/road-safety" className="hover:text-brand-cyan transition-colors">Mine Safety Signage</Link></li>
              <li><Link to="/services/advertising-signage" className="hover:text-brand-cyan transition-colors">Digital Signage</Link></li>
              <li><Link to="/services/vehicle-branding" className="hover:text-brand-cyan transition-colors">Vehicle Wrapping</Link></li>
              <li><Link to="/services/building-branding" className="hover:text-brand-cyan transition-colors">Building Branding</Link></li>
              <li><Link to="/services/digital-printing" className="hover:text-brand-cyan transition-colors">Business Printing</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-brand-cyan flex-shrink-0" />
                <span>Cnr Lantana & Lilac Street, Kuruman</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-brand-magenta flex-shrink-0" />
                <span>+27 53 712 3954</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                <span>sales@papassigns.co.za</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© {new Date().getFullYear()} Papa's Signs Specialists. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
