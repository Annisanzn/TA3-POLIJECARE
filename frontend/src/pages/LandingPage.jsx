import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Articles from '../components/Articles';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';

const LandingPage = () => {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary disable API calls to prevent 404 errors
    const mockHeroData = {
      title: 'Aman Bicara, Aman Melapor',
      subtitle: 'Satgas PPKPT Politeknik Negeri Jember',
      description: 'Kami siap mendengar dan membantu Anda dengan profesionalisme dan kerahasiaan terjamin. Setiap laporan akan ditangani dengan empati dan seksama.'
    };
    
    setHeroData(mockHeroData);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <LoginModal />
      <Hero heroData={heroData} />
      <About />
      <Services />
      <Articles />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;
