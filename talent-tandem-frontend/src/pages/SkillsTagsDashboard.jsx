import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SkillsTagsDashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to new professional admin dashboard
    navigate('/admin');
  }, [navigate]);

  return null;
};

export default SkillsTagsDashboard;

/* OLD CODE - Now using AdminDashboard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SkillsManager from '../components/SkillsManager';
import TagsManager from '../components/TagsManager';
import Footer from '../components/Footer';

const SkillsTagsDashboardOld = () => {
  const [activeTab, setActiveTab] = useState('skills');

  const tabs = [
    { id: 'skills', label: 'Skills Management', icon: '🎯' },
    { id: 'tags', label: 'Tags Management', icon: '🏷️' }
  ];

*/