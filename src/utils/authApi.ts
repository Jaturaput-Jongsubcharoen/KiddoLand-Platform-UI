export type AuthMode = 'home' | 'institution';

export interface AuthLoginResponse {
  access_token: string;
  expires_in: number;
  role: string;
  mode: AuthMode;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

export interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
}

export interface AuthRegisterRequest {
  email: string;
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
