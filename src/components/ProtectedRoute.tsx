import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireMode?: 'home' | 'institution';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireMode 
}) => {
  const { appState, sessionStatus } = useApp();

  if (sessionStatus === 'booting') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Starting KiddoLand demo...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!appState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if the user is in the correct mode
  if (requireMode && appState.selectedMode !== requireMode) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
