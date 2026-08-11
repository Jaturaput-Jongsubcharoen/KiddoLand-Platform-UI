export type AuthMode = 'home' | 'institution';

export interface AuthLoginResponse {
  access_token: string;
  expires_in: number;
  role: 'Parent' | 'Teacher' | 'Admin' | 'Librarian' | 'Guest';
  mode: AuthMode;
  plan: 'free' | 'paid';
  email?: string;
  name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface UserProfile {
  user_id?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: 'Parent' | 'Teacher' | 'Admin' | 'Librarian' | 'Guest';
  mode?: AuthMode;
  plan?: 'free' | 'paid';
}

export interface PlanUpdateResponse {
  success: boolean;
  plan: 'free' | 'paid';
  message: string;
}

export interface AuthRegisterRequest {
  email: string;
  name?: string;
  password: string;
  mode: AuthMode;
  role: 'Parent' | 'Teacher' | 'Admin';
}

interface AuthLoginRequest {
  email: string;
  password: string;
  mode: AuthMode;
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

const resolveApiBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envBaseUrl?.trim() ? envBaseUrl.trim().replace(/\/$/, '') : DEFAULT_API_BASE_URL;
};

export const loginWithPassword = async (payload: AuthLoginRequest): Promise<AuthLoginResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || 'Unable to sign in. Please try again.';
    throw new Error(errorMessage);
  }

  return response.json();
};

export const loginAsGuest = async (): Promise<AuthLoginResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/guest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || 'Unable to start anonymous demo mode.';
    throw new Error(errorMessage);
  }

  return response.json();
};
export const registerWithPassword = async (
  payload: AuthRegisterRequest
): Promise<AuthLoginResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || 'Unable to sign up. Please try again.';
    throw new Error(errorMessage);
  }

  return response.json();
};

export const getUserProfile = async (accessToken: string): Promise<UserProfile> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/validate`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || 'Unable to fetch user profile.';
    throw new Error(errorMessage);
  }

  return response.json();
};

export const refreshSession = async (accessToken: string): Promise<AuthLoginResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || 'Unable to refresh session.';
    throw new Error(errorMessage);
  }

  return response.json();
};

export const updateUserPlan = async (
  accessToken: string,
  plan: 'free' | 'paid'
): Promise<PlanUpdateResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/auth/plan`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plan }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.detail || 'Unable to update plan.';
    throw new Error(errorMessage);
  }

  return response.json();
};
