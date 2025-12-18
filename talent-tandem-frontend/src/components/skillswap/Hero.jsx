import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-white to-teal-50 overflow-hidden relative">
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-orange-500">SkillSwap</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Learning circles are peer-driven study groups for people who want to learn with others.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition"
              >
                Explore Learning Circles
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-orange-500 border-2 border-orange-500 rounded-full font-semibold hover:bg-orange-50 transition"
              >
                Create Free Account
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-orange-400 to-teal-400 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/90 rounded-2xl p-6 backdrop-blur"></div>
                <div className="bg-white/90 rounded-2xl p-6 backdrop-blur"></div>
                <div className="bg-white/90 rounded-2xl p-6 backdrop-blur"></div>
                <div className="bg-white/90 rounded-2xl p-6 backdrop-blur"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
