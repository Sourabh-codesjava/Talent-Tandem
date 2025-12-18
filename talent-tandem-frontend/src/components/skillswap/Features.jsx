import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    { title: 'No expert required', desc: 'Facilitators draw on peer learning principles to help learners reach their goals.' },
    { title: 'Explore any topic', desc: 'Use courses found freely on the internet or create your own.' },
    { title: 'Learn together', desc: 'Learning with others deepens understanding and builds relationships.' },
    { title: 'Access for all', desc: 'High-quality learning in public spaces lowers barriers to education.' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16 text-gray-900"
        >
          Learning circles make peer learning <span className="text-orange-500">simple</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-teal-400 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">✓</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
