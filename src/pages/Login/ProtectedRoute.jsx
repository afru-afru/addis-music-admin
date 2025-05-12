import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); 

  if (isAuthenticated) {
    return children;
  } else {
    return <Navigate to="/" replace />; 
  }
};

export default ProtectedRoute;