import React from 'react';
import NavBar from './NavBar';
import Hero from './Hero';
import Features from './Features';
import MapSection from './MapSection';
import CommunitySection from './CommunitySection';
import TeamSection from './TeamSection';
import AboutSection from './AboutSection';
import Footer from './Footer';

const SkillSwapHome = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <Hero />
      <Features />
      <MapSection />
      <CommunitySection />
      <TeamSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default SkillSwapHome;
