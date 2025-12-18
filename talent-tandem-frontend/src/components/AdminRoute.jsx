import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '1.2rem', color: '#667eea', fontWeight: '600' }}>Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For now, allow all authenticated users to access admin panel
  // You can add role check here: if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
