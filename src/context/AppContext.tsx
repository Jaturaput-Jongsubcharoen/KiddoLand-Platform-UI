import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'home' | 'institution' | null;

interface AppState {
  selectedMode: AppMode;
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  accessToken: string | null;
  userRole: string | null;
  tokenExpiresAt: number | null;
}

interface AppContextType {
  appState: AppState;
  setMode: (mode: AppMode) => void;
  login: (email: string, accessToken?: string, userRole?: string, tokenExpiresAt?: number, userName?: string) => void;
  updateSession: (payload: {
    accessToken: string;
    tokenExpiresAt: number;
    userRole?: string;
    userEmail?: string;
    userName?: string;
  }) => void;
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
          userName: null,
          accessToken: null,
          userRole: null,
          tokenExpiresAt: null,
        };
      }
    }
    return {
      selectedMode: null,
      isAuthenticated: false,
      userEmail: null,
      userName: null,
      accessToken: null,
      userRole: null,
      tokenExpiresAt: null,
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
      userName: null,
      accessToken: null,
      userRole: null,
      tokenExpiresAt: null,
    }));
  };

  const login = (email: string, accessToken?: string, userRole?: string, tokenExpiresAt?: number, userName?: string) => {
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      userEmail: email,
      userName: userName ?? null,
      accessToken: accessToken ?? null,
      userRole: userRole ?? null,
      tokenExpiresAt: tokenExpiresAt ?? null,
    }));
  };

  const updateSession = (payload: {
    accessToken: string;
    tokenExpiresAt: number;
    userRole?: string;
    userEmail?: string;
    userName?: string;
  }) => {
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      accessToken: payload.accessToken,
      tokenExpiresAt: payload.tokenExpiresAt,
      userRole: payload.userRole ?? prev.userRole,
      userEmail: payload.userEmail ?? prev.userEmail,
      userName: payload.userName ?? prev.userName,
    }));
  };

  const logout = () => {
    setAppState({
      selectedMode: null,
      isAuthenticated: false,
      userEmail: null,
      userName: null,
      accessToken: null,
      userRole: null,
      tokenExpiresAt: null,
    });
  };

  useEffect(() => {
    if (!appState.isAuthenticated || !appState.tokenExpiresAt) {
      return;
    }

    const msLeft = appState.tokenExpiresAt - Date.now();
    if (msLeft <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      logout();
    }, msLeft);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appState.isAuthenticated, appState.tokenExpiresAt, logout]);

  return (
    <AppContext.Provider value={{ appState, setMode, login, updateSession, logout }}>
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
