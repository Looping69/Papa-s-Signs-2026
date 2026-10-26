
import React, { useState } from 'react';
import { Menu, X, Printer, Phone } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteConfig } from './SiteConfigProvider';

const Navbar: React.FC = () => {
  const {config}=useSiteConfig();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Smart Quote', path: '/quote' },
  ].filter(link=>link.path!=='/quote'||config?.quoteAssistant?.enabled===true);

  const linkClasses = ({ isActive }: { isActive: boolean }) => 
    `relative font-bold transition-all duration-300 py-2 px-1 ${
      isActive 
        ? 'text-brand-cyan after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-cyan' 
        : 'text-gray-700 hover:text-brand-magenta'
    }`;

  const mobileLinkClasses = ({ isActive }: { isActive: boolean }) => 
    `block w-full text-left px-3 py-4 rounded-md text-base font-bold transition-colors ${
      isActive 
        ? 'bg-brand-cyan/10 text-brand-cyan border-l-4 border-brand-cyan' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-brand-magenta'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link 
            to="/"
            className="flex-shrink-0 flex items-center cursor-pointer group" 
            onClick={() => setIsOpen(false)}
          >
            <div className="bg-brand-black p-2 rounded-lg mr-2 group-hover:bg-brand-cyan transition-colors">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-brand-black leading-none">PAPA'S SIGNS</span>
              <span className="text-[10px] font-bold text-brand-magenta tracking-[0.2em] uppercase">Specialists</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={linkClasses}
              >
                {link.name}
              </NavLink>
            ))}
            <Link 
              to="/contact"
              className="ml-4 bg-brand-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-magenta transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-white border-t border-gray-100 transition-all duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={mobileLinkClasses}
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-4">
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="w-full bg-brand-black text-white px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Us Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
