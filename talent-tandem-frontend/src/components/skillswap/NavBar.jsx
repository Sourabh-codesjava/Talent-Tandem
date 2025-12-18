import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold text-orange-500">SkillSwap</div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#learn" className="text-gray-700 hover:text-orange-500 transition">Learn</a>
            <a href="#facilitate" className="text-gray-700 hover:text-orange-500 transition">Facilitate</a>
            <a href="#community" className="text-gray-700 hover:text-orange-500 transition">Community</a>
            <a href="#about" className="text-gray-700 hover:text-orange-500 transition">About</a>
          </div>

          <div className="flex items-center space-x-3">
            <button className="hidden sm:block px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded-full hover:bg-teal-50 transition">
              Start a Team
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition">
              Sign Up
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 transition">
              Log In
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
