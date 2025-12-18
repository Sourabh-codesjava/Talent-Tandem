import React from 'react';
import { motion } from 'framer-motion';

const CommunitySection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Join the Community</h2>
            <p className="text-gray-600 mb-6">
              Anybody can use SkillSwap's free resources to facilitate learning circles and contribute to our global community of practice.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">✓</span>
                <span className="text-gray-700">Create learning circles</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">✓</span>
                <span className="text-gray-700">Join public events</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">✓</span>
                <span className="text-gray-700">Participate in the community forum</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">✓</span>
                <span className="text-gray-700">Develop and contribute courses</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3">✓</span>
                <span className="text-gray-700">Access facilitator resources</span>
              </li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition"
            >
              Create a Free Account
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-teal-400 to-orange-400 rounded-3xl p-8 shadow-2xl h-96"
          >
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
