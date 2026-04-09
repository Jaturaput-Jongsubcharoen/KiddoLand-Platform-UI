  import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { kiddoTheme } from './theme/theme';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components';
import SessionExpiryWarning from './components/SessionExpiryWarning';

// Pages
import ModeSelectPage from './pages/ModeSelectPage';
import AuthHomePage from './pages/AuthHomePage';
import AuthInstitutionPage from './pages/AuthInstitutionPage';
import HomeDashboardPage from './pages/HomeDashboardPage';
import InstitutionDashboardPage from './pages/InstitutionDashboardPage';
import CreateStoryUnifiedPage from './pages/CreateStoryUnifiedPage';
import StoryHistoryPage from './pages/StoryHistoryPage';
import StoryFavoritesPage from './pages/StoryFavoritesPage';
import CreateRhymePage from './pages/CreateRhymePage';
import PlayLearningActivityPage from './pages/PlayLearningActivityPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={kiddoTheme}>
      <CssBaseline />
      <AppProvider>
        <Router future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true 
        }}>
          <SessionExpiryWarning />
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
              path="/home/create-story"
              element={
                <ProtectedRoute requireMode="home">
                  <CreateStoryUnifiedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home/create-rhyme"
              element={
                <ProtectedRoute requireMode="home">
                  <CreateRhymePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/story-history"
              element={
                <ProtectedRoute requireMode="home">
                  <StoryHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/story-favorites"
              element={
                <ProtectedRoute requireMode="home">
                  <StoryFavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home/play-learning-activity"
              element={
                <ProtectedRoute requireMode="home">
                  <PlayLearningActivityPage />
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
            <Route
              path="/institution/create-story"
              element={
                <ProtectedRoute requireMode="institution">
                  <CreateStoryUnifiedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/play-learning-activity"
              element={
                <ProtectedRoute requireMode="institution">
                  <PlayLearningActivityPage />
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
