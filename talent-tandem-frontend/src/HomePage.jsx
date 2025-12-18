import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import Footer from "./components/Footer";
import Header from "./components/layout/Header";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: '🤖 Hi! I\'m your AI Assistant. How can I help you today?' },
    { type: 'bot', text: 'Ask me anything about mentorship, sessions, or how Talent Tandem works!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setLoading(false);
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) setDarkMode(savedTheme === 'true');
    
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setTimeout(() => setShowCookieConsent(true), 2000);
    }
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleCookieConsent = (accepted) => {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'declined');
    setShowCookieConsent(false);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      alert(`Searching for: ${searchQuery}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');
    setIsSending(true);

    try {
      const response = await fetch('http://localhost:8080/api/ai-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      setChatMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I\'m having trouble connecting. Please try again.' 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFindMentor = () => {
    if (user) {
      if (user.hasLearnerProfile) {
        navigate('/learner/matching');
      } else {
        navigate('/learner/setup');
      }
    } else {
      navigate('/login');
    }
  };

  const handleBecomeMentor = () => {
    if (user) {
      if (user.hasTeachProfile) {
        navigate('/mentor/dashboard');
      } else {
        navigate('/mentor/setup');
      }
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loader"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className={`homepage ${darkMode ? 'dark-mode' : ''}`}>
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      
      <motion.div
        className="custom-cursor"
        style={{
          left: cursorPos.x - 10,
          top: cursorPos.y - 10,
          transform: `scale(${isHovering ? 2 : 1})`
        }}
      />

      {/* Header - Using unified Header component */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-background">
          <motion.div
            className="floating-shape shape-1"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="floating-shape shape-2"
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="container">
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Learn from the world's best mentors for free
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Talent Tandem is the leading free-to-use mentorship platform with mentors in AI, UI/UX design,
              product management, software development and marketing.
            </motion.p>
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                className="btn-primary"
                onClick={handleFindMentor}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                Find a mentor
              </motion.button>
              <motion.button
                className="btn-secondary"
                onClick={handleBecomeMentor}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                Become a mentor
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        className="stats-section"
        id="stats"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="container">
          <div className="stats-grid">
            <motion.div className="stat-item" variants={itemVariants}>
              <motion.div
                className="stat-number"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                20,000+
              </motion.div>
              <div className="stat-label">Mentors</div>
            </motion.div>
            <motion.div className="stat-item" variants={itemVariants}>
              <motion.div
                className="stat-number"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                100,000+
              </motion.div>
              <div className="stat-label">Mentees</div>
            </motion.div>
            <motion.div className="stat-item" variants={itemVariants}>
              <motion.div
                className="stat-number"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                500,000+
              </motion.div>
              <div className="stat-label">Sessions completed</div>
            </motion.div>
            <motion.div className="stat-item" variants={itemVariants}>
              <motion.div
                className="stat-number"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                150+
              </motion.div>
              <div className="stat-label">Countries</div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="features-section"
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What you can learn
          </motion.h2>
          <div className="features-grid">
            <motion.div
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-image ai-image"></div>
              <h3>AI & Machine Learning</h3>
              <p>Learn from AI experts and data scientists</p>
            </motion.div>
            <motion.div
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-image design-image"></div>
              <h3>UI/UX Design</h3>
              <p>Master design thinking and user experience</p>
            </motion.div>
            <motion.div
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-image product-image"></div>
              <h3>Product Management</h3>
              <p>Build and launch successful products</p>
            </motion.div>
            <motion.div
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-image dev-image"></div>
              <h3>Software Development</h3>
              <p>Code better and advance your tech career</p>
            </motion.div>
            <motion.div
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-image marketing-image"></div>
              <h3>Marketing</h3>
              <p>Grow your brand and reach more customers</p>
            </motion.div>
            <motion.div
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-image career-image"></div>
              <h3>Career Development</h3>
              <p>Navigate your career path with confidence</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How it works Section */}
      <motion.section
        className="how-it-works"
        id="how-it-works"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How it works
          </motion.h2>
          <div className="steps-grid">
            <motion.div
              className="step-card"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="step-number"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                1
              </motion.div>
              <h3>Browse mentors</h3>
              <p>Explore thousands of mentors across different fields and expertise levels</p>
            </motion.div>
            <motion.div
              className="step-card"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="step-number"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                2
              </motion.div>
              <h3>Book a session</h3>
              <p>Schedule a free 1-on-1 session with your chosen mentor</p>
            </motion.div>
            <motion.div
              className="step-card"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="step-number"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                3
              </motion.div>
              <h3>Learn & grow</h3>
              <p>Get personalized advice and accelerate your career growth</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="testimonials-section"
        id="testimonials"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What our community says
          </motion.h2>
          <div className="testimonials-grid">
            <motion.div
              className="testimonial-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="testimonial-content">
                <p>"Talent Tandem has been a game-changer for my career. The mentors are incredibly knowledgeable and generous with their time."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <div className="author-name">Monika Rajput</div>
                  <div className="author-title">Product Designer at Google</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="testimonial-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="testimonial-content">
                <p>"I've learned more in a few sessions than I did in months of self-study. The personalized guidance is invaluable."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <div className="author-name">Jyoti Chouhan</div>
                  <div className="author-title">Software Engineer at Microsoft</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="testimonial-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="testimonial-content">
                <p>"Being a mentor on Talent Tandem has been incredibly rewarding. I love helping the next generation of professionals."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <div className="author-name">Sourabh Yadav</div>
                  <div className="author-title">VP of Marketing at Stripe</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        id="cta"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2>Ready to accelerate your career?</h2>
            <p>Join thousands of professionals who are already learning from the best mentors in the industry.</p>
            <div className="cta-buttons">
              <motion.button
                className="btn-primary"
                onClick={handleFindMentor}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Find a mentor
              </motion.button>
              <motion.button
                className="btn-secondary"
                onClick={handleBecomeMentor}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Become a mentor
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="scroll-to-top"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="cookie-consent"
          >
            <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
            <div className="cookie-buttons">
              <button onClick={() => handleCookieConsent(true)} className="accept-btn">Accept</button>
              <button onClick={() => handleCookieConsent(false)} className="decline-btn">Decline</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="search-overlay"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              className="search-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSearchOpen(false)} className="close-search">×</button>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search mentors, skills, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit">Search</button>
              </form>
              <div className="search-suggestions">
                <p>Popular searches:</p>
                <div className="tags">
                  <span onClick={() => { setSearchQuery('AI'); handleSearch({ preventDefault: () => {} }); }}>AI</span>
                  <span onClick={() => { setSearchQuery('Design'); handleSearch({ preventDefault: () => {} }); }}>Design</span>
                  <span onClick={() => { setSearchQuery('Marketing'); handleSearch({ preventDefault: () => {} }); }}>Marketing</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="chat-widget"
          >
            <div className="chat-header">
              <div className="chat-status">
                <span className="ai-badge">🤖 AI</span>
                <span>Smart Assistant</span>
              </div>
              <button onClick={() => setShowChat(false)}>×</button>
            </div>
            <div className="chat-body">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.type}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isSending && (
                <div className="chat-message bot">
                  <p>Typing...</p>
                </div>
              )}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Ask AI anything..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isSending}
              />
              <button type="submit" disabled={isSending}>
                {isSending ? '⏳' : '➤'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HomePage;