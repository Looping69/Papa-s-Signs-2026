import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SiteConfigProvider, useSiteConfig } from './components/SiteConfigProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceCategoryPage from './pages/ServiceCategoryPage';
import GalleryPage from './pages/GalleryPage';
import QuotePage from './pages/QuotePage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAccess from './components/admin/AdminAccess';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Scroll to top on route change component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <SiteConfigProvider><Router>
      <AppContent />
    </Router></SiteConfigProvider>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isQuotePage = location.pathname === '/quote';
  const isAdmin = location.pathname === '/admin';
  const {config,loading}=useSiteConfig();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isAdmin&&<Navbar />}
      <ScrollToTop />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:categoryId" element={<ServiceCategoryPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/quote" element={loading?<p role="status" className="pt-32 text-center">Checking availability…</p>:config?.quoteAssistant?.enabled===true?<QuotePage />:<Navigate to="/contact" replace/>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminAccess>{(logout,active)=><AdminDashboard onLogout={logout} accessActive={active}/>}</AdminAccess>} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          {/* Fallback to Home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isQuotePage && !isAdmin && <Footer />}
    </div>
  );
};

export default App;
