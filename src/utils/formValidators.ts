// Form validation utilities for KiddoLand

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

// Allowed institution email domains
// Update this list if you want to allow more domains.
export const ALLOWED_INSTITUTION_DOMAINS = ['school.ca', 'board.ca', 'library.org'];
export const INSTITUTION_TLDS = ['.edu', '.school', '.k12'];

export const isInstitutionEmailAllowed = (
  email: string,
  allowlist: string[] = ALLOWED_INSTITUTION_DOMAINS
): boolean => {
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return false;
  const domain = email.slice(atIndex + 1).toLowerCase();
  if (!domain) return false;

  if (INSTITUTION_TLDS.some((tld) => domain.endsWith(tld))) {
    return true;
  }

  return allowlist.some((allowed) => domain.endsWith(allowed.toLowerCase()));
};

export const validateInstitutionEmail = (
  email: string
): { isValid: boolean; error?: string } => {
  const basicValidation = validateEmail(email);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const isAllowed = isInstitutionEmailAllowed(email);
  if (!isAllowed) {
    return {
      isValid: false,
      error:
        'Institution Mode is for teachers/librarians. Please use an approved school/library email or switch to Home Mode.',
    };
  }

  return { isValid: true };
};

export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  if (!hasNumber || !hasLetter) {
    return { isValid: false, error: 'Password must contain at least 1 letter and 1 number' };
  }

  return { isValid: true };
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Please enter a valid name' };
  }

  return { isValid: true };
};
