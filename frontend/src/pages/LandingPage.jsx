import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Articles from '../components/Articles';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { heroService } from '../services/heroService';

const LandingPage = () => {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await heroService.get();
      if (response.success) {
        setHeroData(response.data);
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
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
