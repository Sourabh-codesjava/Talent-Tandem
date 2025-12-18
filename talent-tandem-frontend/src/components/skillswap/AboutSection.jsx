import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  const testimonials = [
    { name: 'Sarah Chen', role: 'Learning Circle Participant', org: 'Boston Public Library', quote: 'I joined a learning circle so I could be in an environment where everyone is vested in the work and progress.' },
    { name: 'Marcus Johnson', role: 'Facilitator', org: 'Chicago Public Library', quote: 'The very act of making education accessible, free, and learner-driven is the heart of democracy.' },
    { name: 'Emily Rodriguez', role: 'Learning Circle Participant', org: 'Detroit Public Library', quote: 'To have such a program is a valuable resource for us to participate in and grow together.' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-6 text-gray-900">About SkillSwap</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-4xl">
            SkillSwap is a grassroots community supporting equitable, empowering peer learning in public spaces worldwide. 
            Since our founding, we have worked with libraries and community centers to offer community-based education through learning circles.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition mb-16"
          >
            More About Us
          </motion.button>
        </motion.div>

        <h3 className="text-3xl font-bold mb-12 text-center text-gray-900">What our community says</h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-2xl p-6 shadow-lg"
            >
              <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-teal-400 rounded-full mr-4"></div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.org}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
