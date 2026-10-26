
import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useSiteConfig } from './SiteConfigProvider';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const {config}=useSiteConfig();
  
  // Mouse tracking for parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setMousePos({ x, y });
  };

  // Parallax transforms
  const orb1X = useTransform(mouseX, [-0.5, 0.5], [-50, 50]);
  const orb1Y = useTransform(mouseY, [-0.5, 0.5], [-50, 50]);
  const orb2X = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const orb2Y = useTransform(mouseY, [-0.5, 0.5], [30, -30]);
  const orb3X = useTransform(mouseX, [-0.5, 0.5], [-80, 80]);
  const orb3Y = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);
  const bgScale = useTransform(mouseY, [-0.5, 0.5], [1, 1.05]);

  // Floating shape transforms
  const shape1X = useTransform(mouseX, [-0.5, 0.5], [-100, 100]);
  const shape1Y = useTransform(mouseY, [-0.5, 0.5], [-100, 100]);
  const shape2X = useTransform(mouseX, [-0.5, 0.5], [150, -150]);
  const shape2Y = useTransform(mouseY, [-0.5, 0.5], [50, -50]);
  const shape3X = useTransform(mouseX, [-0.5, 0.5], [50, -50]);
  const shape3Y = useTransform(mouseY, [-0.5, 0.5], [150, -150]);

  if (!config) return <div className="min-h-[95vh] bg-brand-dark"></div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const titleWords = (config?.hero?.title || "").split(' ');
  const firstWord = titleWords[0];
  const restOfTitle = titleWords.slice(1).join(' ');

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="hero" 
      className="relative bg-brand-dark pt-20 overflow-hidden min-h-[95vh] flex items-center group/hero"
    >
      {/* Background Layer with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          style={{ scale: bgScale }}
          src={config?.hero?.backgroundImage || ""} 
          alt="Printing Workshop" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-brand-dark/95 to-transparent"></div>
        
        {/* Animated Scanning Beam */}
        <motion.div 
          animate={{ 
            top: ["0%", "100%", "0%"],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute left-0 w-full h-[1px] bg-brand-cyan shadow-[0_0_20px_rgba(0,174,239,1)] z-10"
        />
      </div>

      {/* Interactive CMYK Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ x: orb1X, y: orb1Y }}
          className="absolute top-1/4 left-1/2 w-64 h-64 bg-brand-cyan/10 rounded-full blur-[80px]"
        />
        <motion.div 
          style={{ x: orb2X, y: orb2Y }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-magenta/10 rounded-full blur-[100px]"
        />
        <motion.div 
          style={{ x: orb3X, y: orb3Y }}
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-brand-yellow/10 rounded-full blur-[60px]"
        />

        {/* Floating CMYK Shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ x: shape1X, y: shape1Y }}
          className="absolute top-1/3 right-1/3 w-12 h-12 border-2 border-brand-cyan/20 rounded-lg"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ x: shape2X, y: shape2Y }}
          className="absolute bottom-1/3 left-1/4 w-16 h-16 border-2 border-brand-magenta/20 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ x: shape3X, y: shape3Y }}
          className="absolute top-1/4 left-1/4 w-8 h-8 bg-brand-yellow/10 rotate-45"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="md:w-2/3 lg:w-3/5">
          {/* Animated Color Bars */}
          <div className="flex gap-2 mb-8 h-1.5 max-w-[200px]">
            {['cyan', 'magenta', 'yellow', 'white/20'].map((color, i) => (
              <motion.div
                key={color}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, ease: "circOut" }}
                className={`h-full bg-brand-${color.split('/')[0]} ${color.includes('/') ? 'bg-white/20' : ''} rounded-full`}
              />
            ))}
          </div>
          
          <div className="space-y-6">
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter"
            >
              {firstWord} <br/>
              <motion.span 
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-magenta bg-[length:200%_auto]"
              >
                {config?.hero?.subtitle || ""}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-300 max-w-xl font-light leading-relaxed"
            >
              {config?.hero?.description || ""}
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5 pt-4"
            >
              <motion.button 
                whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(0,174,239,0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(config?.quoteAssistant?.enabled===true?'/quote':'/contact')}
                className="relative overflow-hidden bg-brand-cyan text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group/btn"
              >
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-white/20 skew-x-12"
                />
                <Sparkles className="w-5 h-5 text-brand-yellow" />
                {config?.quoteAssistant?.enabled===true?'Smart Quote Assistant':'Request a Staff Quote'}
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/services')}
                className="px-10 py-5 rounded-2xl font-bold text-lg text-white border-2 border-white/20 transition-all backdrop-blur-sm"
              >
                View Services
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Floating Stats */}
      <div className="absolute bottom-20 right-20 hidden lg:flex flex-col gap-8">
        {(config?.stats || []).map((stat, idx) => (
          <motion.div 
            key={stat.id}
            variants={itemVariants}
            custom={idx}
            className="flex items-center gap-4 group/stat"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5, ease: "easeInOut" }}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                idx === 0 ? 'bg-brand-cyan/20 border-brand-cyan/30 text-brand-cyan' :
                idx === 1 ? 'bg-brand-magenta/20 border-brand-magenta/30 text-brand-magenta' :
                'bg-brand-yellow/20 border-brand-yellow/30 text-brand-yellow'
              }`}
            >
              <span className="font-black">{stat.id}</span>
            </motion.div>
            <div className="text-left">
              <div className="text-white font-bold leading-none">{stat.title}</div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Hero;
