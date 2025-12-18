import React from 'react';
import { motion } from 'framer-motion';

const MapSection = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4 text-gray-900"
        >
          Join a Learning Circle
        </motion.h2>
        <p className="text-xl text-gray-600 mb-12">Learning circles meet every week around the world</p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-teal-100 to-orange-100 rounded-3xl p-12 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-10 left-20 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-32 w-4 h-4 bg-teal-500 rounded-full animate-pulse animation-delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-4 h-4 bg-orange-500 rounded-full animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-32 right-20 w-4 h-4 bg-teal-500 rounded-full animate-pulse animation-delay-500"></div>
          
          <div className="h-64 flex items-center justify-center">
            <span className="text-6xl opacity-20">🌍</span>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-orange-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-orange-600 transition"
        >
          Explore Now
        </motion.button>
      </div>
    </section>
  );
};

export default MapSection;
