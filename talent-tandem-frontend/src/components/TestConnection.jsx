import React, { useState } from 'react';
import ApiService from '../services/api';

const TestConnection = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connection...');
    
    try {
      // Test health endpoint
      const healthResponse = await fetch('http://localhost:8080/health');
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      // Test skills endpoint
      const skillsResponse = await ApiService.getAllSkills();
      
      setStatus(`✅ Backend Connected! Found ${skillsResponse.length} skills`);
    } catch (error) {
      setStatus(`❌ Connection Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAI = async () => {
    setLoading(true);
    setStatus('Testing AI normalization...');
    
    try {
      const testSkills = ['javascript', 'reactjs', 'node js'];
      const normalized = await ApiService.normalizeSkills(testSkills);
      setStatus(`✅ AI Working! Normalized: ${normalized.join(', ')}`);
    } catch (error) {
      setStatus(`❌ AI Test Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '1rem', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '14px' }}>Backend Test</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {loading ? 'Testing...' : 'Test Backend'}
        </button>
        <button 
          onClick={testAI} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {loading ? 'Testing...' : 'Test AI'}
        </button>
      </div>
      {status && (
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '12px',
          padding: '0.5rem',
          backgroundColor: status.includes('✅') ? '#dcfce7' : '#fee2e2',
          color: status.includes('✅') ? '#16a34a' : '#dc2626',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default TestConnection;