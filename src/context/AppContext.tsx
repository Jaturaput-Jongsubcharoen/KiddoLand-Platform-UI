import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { loginAsGuest } from '../utils/authApi';

export type AppMode = 'home' | 'institution' | null;

interface AppState {
  selectedMode: AppMode;
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  accessToken: string | null;
  userRole: string | null;
  userPlan: 'free' | 'paid';
  tokenExpiresAt: number | null;
}

interface AppContextType {
  appState: AppState;
  sessionStatus: 'booting' | 'ready';
  setMode: (mode: AppMode) => void;
  login: (
    email: string,
    accessToken?: string,
    userRole?: string,
    tokenExpiresAt?: number,
    userName?: string,
    userPlan?: 'free' | 'paid'
  ) => void;
  updateSession: (payload: {
    accessToken: string;
    tokenExpiresAt: number;
    userRole?: string;
    userEmail?: string;
    userName?: string;
    userPlan?: 'free' | 'paid';
  }) => void;
  setUserPlan: (plan: 'free' | 'paid') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'kiddoland_app_state';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const guestBootstrapRequestId = useRef(0);
  const [sessionStatus, setSessionStatus] = useState<'booting' | 'ready'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return 'booting';
    }

    try {
      const parsed = JSON.parse(stored) as Partial<AppState>;
      return parsed.accessToken ? 'ready' : 'booting';
    } catch {
      return 'booting';
    }
  });

  const [appState, setAppState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AppState>;
        return {
          selectedMode: parsed.selectedMode ?? null,
          isAuthenticated: parsed.isAuthenticated ?? false,
          userEmail: parsed.userEmail ?? null,
          userName: parsed.userName ?? null,
          accessToken: parsed.accessToken ?? null,
          userRole: parsed.userRole ?? null,
          userPlan: parsed.userPlan === 'paid' ? 'paid' : 'free',
          tokenExpiresAt: parsed.tokenExpiresAt ?? null,
        };
      } catch {
        return {
          selectedMode: null,
          isAuthenticated: false,
          userEmail: null,
          userName: null,
          accessToken: null,
          userRole: null,
          userPlan: 'free',
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
      userPlan: 'free',
      tokenExpiresAt: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    if (appState.accessToken) {
      setSessionStatus('ready');
      return;
    }

    if (sessionStatus !== 'booting') {
      return;
    }

    const requestId = ++guestBootstrapRequestId.current;
    let cancelled = false;

    const bootstrapGuest = async () => {
      try {
        const response = await loginAsGuest();
        if (cancelled || requestId !== guestBootstrapRequestId.current) {
          return;
        }

        const tokenExpiresAt = Date.now() + response.expires_in * 1000;
        setAppState(prev => ({
          ...prev,
          selectedMode: 'home',
          isAuthenticated: true,
          userEmail: response.email ?? null,
          userName: response.full_name || response.name || 'Anonymous Guest',
          accessToken: response.access_token,
          userRole: response.role,
          userPlan: response.plan,
          tokenExpiresAt,
        }));
        localStorage.setItem('accessToken', response.access_token);
        setSessionStatus('ready');
      } catch {
        if (cancelled || requestId !== guestBootstrapRequestId.current) {
          return;
        }
        setSessionStatus('ready');
      }
    };

    void bootstrapGuest();

    return () => {
      cancelled = true;
    };
  }, [appState.accessToken, sessionStatus]);

  const setMode = (mode: AppMode) => {
    setAppState(prev => ({
      ...prev,
      selectedMode: mode,
      isAuthenticated: false,
      userEmail: null,
      userName: null,
      accessToken: null,
      userRole: null,
      userPlan: 'free',
      tokenExpiresAt: null,
    }));
  };

  const login = (
    email: string,
    accessToken?: string,
    userRole?: string,
    tokenExpiresAt?: number,
    userName?: string,
    userPlan: 'free' | 'paid' = 'free',
  ) => {
    guestBootstrapRequestId.current += 1;
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      userEmail: email,
      userName: userName ?? null,
      accessToken: accessToken ?? null,
      userRole: userRole ?? null,
      userPlan,
      tokenExpiresAt: tokenExpiresAt ?? null,
    }));
    setSessionStatus('ready');
  };

  const updateSession = (payload: {
    accessToken: string;
    tokenExpiresAt: number;
    userRole?: string;
    userEmail?: string;
    userName?: string;
    userPlan?: 'free' | 'paid';
  }) => {
    guestBootstrapRequestId.current += 1;
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      accessToken: payload.accessToken,
      tokenExpiresAt: payload.tokenExpiresAt,
      userRole: payload.userRole ?? prev.userRole,
      userPlan: payload.userPlan ?? prev.userPlan,
      userEmail: payload.userEmail ?? prev.userEmail,
      userName: payload.userName ?? prev.userName,
    }));
    setSessionStatus('ready');
  };

  const setUserPlan = (plan: 'free' | 'paid') => {
    setAppState((prev) => ({ ...prev, userPlan: plan }));
  };

  const logout = () => {
    guestBootstrapRequestId.current += 1;
    localStorage.removeItem('accessToken');
    setAppState({
      selectedMode: null,
      isAuthenticated: false,
      userEmail: null,
      userName: null,
      accessToken: null,
      userRole: null,
      userPlan: 'free',
      tokenExpiresAt: null,
    });
    setSessionStatus('booting');
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
  }, [appState.isAuthenticated, appState.tokenExpiresAt]);

  return (
    <AppContext.Provider value={{ appState, sessionStatus, setMode, login, updateSession, setUserPlan, logout }}>
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
