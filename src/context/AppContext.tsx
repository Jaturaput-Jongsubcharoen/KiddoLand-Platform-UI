import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'home' | 'institution' | null;

interface AppState {
  selectedMode: AppMode;
  isAuthenticated: boolean;
  userEmail: string | null;
}

interface AppContextType {
  appState: AppState;
  setMode: (mode: AppMode) => void;
  login: (email: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kiddoland_app_state';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          selectedMode: null,
          isAuthenticated: false,
          userEmail: null,
        };
      }
    }
    return {
      selectedMode: null,
      isAuthenticated: false,
      userEmail: null,
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const setMode = (mode: AppMode) => {
    setAppState(prev => ({
      ...prev,
      selectedMode: mode,
      // Reset auth when changing mode
      isAuthenticated: false,
      userEmail: null,
    }));
  };

  const login = (email: string) => {
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      userEmail: email,
    }));
  };

  const logout = () => {
    setAppState({
      selectedMode: null,
      isAuthenticated: false,
      userEmail: null,
    });
  };

  return (
    <AppContext.Provider value={{ appState, setMode, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
