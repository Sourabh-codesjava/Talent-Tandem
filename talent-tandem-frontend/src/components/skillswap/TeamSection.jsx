import React from 'react';
import { motion } from 'framer-motion';

const TeamSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-400 to-teal-400 rounded-3xl p-8 shadow-2xl h-96 order-2 md:order-1"
          >
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Join as a Team</h2>
            <p className="text-gray-600 mb-6">
              Organizations interested in comprehensive learning circle support from SkillSwap can start a Team.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-teal-500 mr-3">✓</span>
                <span className="text-gray-700">Staff Professional Development</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-3">✓</span>
                <span className="text-gray-700">1:1 Support</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-3">✓</span>
                <span className="text-gray-700">Community-Powered OER Library</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-3">✓</span>
                <span className="text-gray-700">Software for Teams</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-3">✓</span>
                <span className="text-gray-700">Community of Practice</span>
              </li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-teal-500 text-white rounded-full font-semibold shadow-lg hover:bg-teal-600 transition"
            >
              Learn More About Teams
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
