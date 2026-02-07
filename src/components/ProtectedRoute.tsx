import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireMode?: 'home' | 'institution';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireMode 
}) => {
  const { appState } = useApp();

  // Check if user is authenticated
  if (!appState.isAuthenticated) {
    // If a specific mode is required and not selected, redirect to mode selection
    if (requireMode && appState.selectedMode !== requireMode) {
      return <Navigate to="/" replace />;
    }
    // Otherwise redirect to the appropriate auth page
    const authRoute = appState.selectedMode ? `/auth/${appState.selectedMode}` : '/';
    return <Navigate to={authRoute} replace />;
  }

  // Check if the user is in the correct mode
  if (requireMode && appState.selectedMode !== requireMode) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
