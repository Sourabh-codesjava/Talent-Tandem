import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../services/api';

const TagsManager = () => {
  const [skills, setSkills] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    skillId: ''
  });
  const [skillTags, setSkillTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSkills();
    loadTags();
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      loadTagsForSkill(selectedSkill);
    }
  }, [selectedSkill]);

  const loadSkills = async () => {
    try {
      const skillsData = await ApiService.getAllSkills();
      setSkills(skillsData);
    } catch (error) {
      setError('Failed to load skills');
    }
  };

  const loadTags = async () => {
    try {
      const tagsData = await ApiService.getAllTags();
      setTags(tagsData);
    } catch (error) {
      setError('Failed to load tags');
    }
  };

  const loadTagsForSkill = async (skillId) => {
    try {
      const skillTagsData = await ApiService.getTagsBySkill(skillId);
      setSkillTags(skillTagsData);
    } catch (error) {
      setError('Failed to load tags for skill');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim() || !newTag.skillId) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const tagData = {
        name: newTag.name.trim(),
        description: newTag.description.trim(),
        skillId: parseInt(newTag.skillId)
      };
      
      const response = await ApiService.addTag(tagData);
      setTags([...tags, response]);
      
      // Refresh skill tags if viewing the same skill
      if (selectedSkill === newTag.skillId) {
        loadTagsForSkill(selectedSkill);
      }
      
      setNewTag({ name: '', description: '', skillId: '' });
      setSuccess('Tag added successfully!');
    } catch (error) {
      setError(error.message || 'Failed to add tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTag(prev => ({
      ...prev,
      [name]: value
    }));
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
        Tags Management
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

      {/* Add New Tag */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>
          Add New Tag
        </h3>
        <form onSubmit={handleAddTag} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Tag Name *
              </label>
              <input
                type="text"
                name="name"
                value={newTag.name}
                onChange={handleInputChange}
                placeholder="e.g., Frontend, Backend, API Design"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'text',
                  pointerEvents: 'auto'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Skill *
              </label>
              <select
                name="skillId"
                value={newTag.skillId}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                <option value="">Select a skill</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.skillName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={newTag.description}
              onChange={handleInputChange}
              placeholder="Brief description of this tag..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical',
                cursor: 'text',
                pointerEvents: 'auto'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !newTag.name.trim() || !newTag.skillId}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              opacity: isLoading || !newTag.name.trim() || !newTag.skillId ? 0.5 : 1,
              justifySelf: 'start'
            }}
          >
            {isLoading ? 'Adding...' : 'Add Tag'}
          </button>
        </form>
      </motion.div>

      {/* View Tags by Skill */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>
          View Tags by Skill
        </h3>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
        >
          <option value="">Select a skill to view its tags</option>
          {skills.map(skill => (
            <option key={skill.id} value={skill.id}>
              {skill.skillName}
            </option>
          ))}
        </select>

        {selectedSkill && (
          <div style={{ 
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>
              Tags for {skills.find(s => s.id.toString() === selectedSkill)?.skillName} ({skillTags.length})
            </h4>
            {skillTags.length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No tags found for this skill</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {skillTags.map((tag) => (
                  <div
                    key={tag.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ fontWeight: '500', color: '#374151' }}>{tag.name}</div>
                    {tag.description && (
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {tag.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* All Tags List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>
          All Tags ({tags.length})
        </h3>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          {tags.length === 0 ? (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No tags added yet</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#374151' }}>{tag.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{tag.skillName}</div>
                      {tag.description && (
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {tag.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TagsManager;