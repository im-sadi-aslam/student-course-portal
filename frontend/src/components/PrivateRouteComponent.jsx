import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRouteComponent = ({ children, adminOnly = false, teacherOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (teacherOnly && user?.role !== 'teacher' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRouteComponent;