import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../services/api';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [rawSkills, setRawSkills] = useState('');
  const [normalizedSkills, setNormalizedSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const skillsData = await ApiService.getAllSkills();
      setSkills(skillsData);
    } catch (error) {
      setError('Failed to load skills');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await ApiService.addSkill({ skillName: newSkill.trim() });
      setSkills([...skills, response]);
      setNewSkill('');
      setSuccess('Skill added successfully!');
    } catch (error) {
      setError(error.message || 'Failed to add skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNormalizeSkills = async () => {
    if (!rawSkills.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const skillsArray = rawSkills.split(',').map(s => s.trim()).filter(s => s);
      const normalized = await ApiService.normalizeSkills(skillsArray);
      setNormalizedSkills(normalized);
      setSuccess('Skills normalized successfully!');
    } catch (error) {
      setError(error.message || 'Failed to normalize skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNormalizedSkills = async () => {
    if (normalizedSkills.length === 0) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const skillObjects = normalizedSkills.map(skill => ({ skillName: skill }));
      const response = await ApiService.addSkillBatch(skillObjects);
      setSkills([...skills, ...response]);
      setNormalizedSkills([]);
      setRawSkills('');
      setSuccess(`${response.length} skills added successfully!`);
    } catch (error) {
      setError(error.message || 'Failed to add normalized skills');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '2rem auto', 
      padding: '2.5rem',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(106, 90, 224, 0.15), 0 0 0 1px rgba(106, 90, 224, 0.1)',
      cursor: 'auto',
      pointerEvents: 'auto',
      userSelect: 'text',
      border: '2px solid rgba(255, 255, 255, 0.8)'
    }}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: '#1e293b'
        }}
      >
        Skills & AI Management
      </motion.h2>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ 
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            color: '#dc2626', 
            padding: '1.25rem 1.5rem', 
            borderRadius: '16px', 
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.1)',
            border: '2px solid rgba(252, 165, 165, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '320px',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>❌</span>
          <span style={{ flex: 1 }}>{error}</span>
        </motion.div>
      )}
      
      {success && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ 
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            color: '#16a34a', 
            padding: '1.25rem 1.5rem', 
            borderRadius: '16px', 
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(22, 163, 74, 0.3), 0 0 0 1px rgba(22, 163, 74, 0.1)',
            border: '2px solid rgba(134, 239, 172, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '320px',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>✅</span>
          <span style={{ flex: 1 }}>{success}</span>
        </motion.div>
      )}

      {/* Add Single Skill */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>
          Add Single Skill
        </h3>
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Enter skill name (e.g., React, Python, UI Design)"
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              cursor: 'text',
              pointerEvents: 'auto'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !newSkill.trim()}
            style={{
              padding: '0.875rem 2rem',
              background: isLoading || !newSkill.trim() 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading || !newSkill.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              boxShadow: isLoading || !newSkill.trim() 
                ? 'none'
                : '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && newSkill.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isLoading || !newSkill.trim() 
                ? 'none'
                : '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            {isLoading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                Adding...
              </>
            ) : (
              <>
                ➕ Add Skill
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* AI Skill Normalization */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>
          AI Skill Normalization
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Enter raw skills separated by commas. AI will normalize and standardize them.
        </p>
        <textarea
          value={rawSkills}
          onChange={(e) => setRawSkills(e.target.value)}
          placeholder="javascript, reactjs, react.js, node js, nodejs, python programming, machine learning, ML, artificial intelligence"
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            resize: 'vertical',
            cursor: 'text',
            pointerEvents: 'auto'
          }}
        />
        <button
          onClick={handleNormalizeSkills}
          disabled={isLoading || !rawSkills.trim()}
          style={{
            padding: '0.875rem 2rem',
            background: isLoading || !rawSkills.trim()
              ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: isLoading || !rawSkills.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: isLoading || !rawSkills.trim()
              ? 'none'
              : '0 4px 15px rgba(240, 147, 251, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && rawSkills.trim()) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(240, 147, 251, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isLoading || !rawSkills.trim()
              ? 'none'
              : '0 4px 15px rgba(240, 147, 251, 0.3)';
          }}
        >
          {isLoading ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
              Normalizing...
            </>
          ) : (
            <>
              🤖 Normalize with AI
            </>
          )}
        </button>
      </motion.div>

      {/* Normalized Results */}
      {normalizedSkills.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}
        >
          <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>
            Normalized Skills ({normalizedSkills.length})
          </h4>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {normalizedSkills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
          <button
            onClick={handleAddNormalizedSkills}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              background: isLoading
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: isLoading
                ? 'none'
                : '0 4px 15px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isLoading
                ? 'none'
                : '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            {isLoading ? '⏳ Adding...' : '✅ Add All Normalized Skills'}
          </button>
        </motion.div>
      )}

      {/* Skills List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>
          Current Skills ({skills.length})
        </h3>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          {skills.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No skills added yet</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    border: '1px solid #d1d5db'
                  }}
                >
                  {skill.skillName}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SkillsManager;