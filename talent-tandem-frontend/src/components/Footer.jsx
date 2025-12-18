import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Talent Tandem</h3>
            <p>Professional mentorship platform connecting learners with industry experts.</p>
          </div>
          
          <div className="footer-section">
            <h4>Platform</h4>
            <Link to="/login">Find a Mentor</Link>
            <Link to="/login">Become a Mentor</Link>
            <Link to="/login">Browse Sessions</Link>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Talent Tandem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;