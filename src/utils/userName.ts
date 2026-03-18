import { AuthLoginResponse, UserProfile } from './authApi';

const cleanValue = (value?: string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const resolveNameFromAuthResponse = (
  response?: AuthLoginResponse | null
): string | undefined => {
  if (!response) return undefined;
  const directName =
    cleanValue(response.name) || cleanValue(response.username) || cleanValue(response.full_name);
  if (directName) {
    return directName;
  }
  const firstName = cleanValue(response.first_name);
  const lastName = cleanValue(response.last_name);
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  return firstName || lastName;
};

export const resolveNameFromProfile = (profile?: UserProfile | null): string | undefined => {
  if (!profile) return undefined;
  const directName = cleanValue(profile.name);
  if (directName) {
    return directName;
  }
  const fullName = cleanValue(profile.full_name);
  if (fullName) {
    return fullName;
  }
  const firstName = cleanValue(profile.first_name);
  const lastName = cleanValue(profile.last_name);
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  return firstName || lastName;
};

export const fallbackNameFromEmail = (email: string): string => {
  const trimmed = email.trim();
  if (!trimmed) return '';
  const atIndex = trimmed.indexOf('@');
  return atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;
};
