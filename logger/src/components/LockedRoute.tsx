import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LockedRouteProps {
  children: React.ReactNode;
}

const LockedRoute: React.FC<LockedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

export default LockedRoute;