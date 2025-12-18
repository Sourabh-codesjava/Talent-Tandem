import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold mb-4">Learn</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-orange-400 transition">Join a Learning Circle</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Browse Topics</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Facilitate</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-orange-400 transition">Start a Circle</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Resources</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Community Forum</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">About</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-orange-400 transition">Our Story</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-orange-400 transition">Help</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="px-6 py-2 bg-orange-500 text-white rounded-r-full hover:bg-orange-600 transition">
                Subscribe
              </button>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-orange-400 transition">📘</a>
              <a href="#" className="hover:text-orange-400 transition">🐦</a>
              <a href="#" className="hover:text-orange-400 transition">📷</a>
              <a href="#" className="hover:text-orange-400 transition">💼</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">© 2024 SkillSwap. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-orange-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-orange-400 transition">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
