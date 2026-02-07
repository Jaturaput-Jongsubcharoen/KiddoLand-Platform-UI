import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { kiddoTheme } from './theme/theme';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components';

// Pages
import ModeSelectPage from './pages/ModeSelectPage';
import AuthHomePage from './pages/AuthHomePage';
import AuthInstitutionPage from './pages/AuthInstitutionPage';
import HomeDashboardPage from './pages/HomeDashboardPage';
import InstitutionDashboardPage from './pages/InstitutionDashboardPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={kiddoTheme}>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Routes>
            {/* Mode Selection */}
            <Route path="/" element={<ModeSelectPage />} />

            {/* Auth Routes */}
            <Route path="/auth/home" element={<AuthHomePage />} />
            <Route path="/auth/institution" element={<AuthInstitutionPage />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute requireMode="home">
                  <HomeDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution"
              element={
                <ProtectedRoute requireMode="institution">
                  <InstitutionDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to mode selection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
