import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { KiddoButton, InfoTooltip, AuthLayout } from '../components';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
} from '../utils/formValidators';

export const AuthHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setMode, appState } = useApp();

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });

  useEffect(() => {
    if (appState.selectedMode !== 'home') {
      setMode('home');
    }
  }, [appState.selectedMode, setMode]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const emailValidation = validateEmail(signInEmail);
    if (!emailValidation.isValid) {
      setSignInError(emailValidation.error || 'Invalid email');
      return;
    }

    if (!signInPassword) {
      setSignInError('Password is required');
      return;
    }

    login(signInEmail);
    navigate('/home');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { name: '', email: '', password: '', confirmPassword: '', terms: '' };

    const nameValidation = validateName(signUpName);
    const emailValidation = validateEmail(signUpEmail);
    const passwordValidation = validatePassword(signUpPassword);
    const confirmPasswordValidation = validateConfirmPassword(
      signUpPassword,
      signUpConfirmPassword
    );

    if (!nameValidation.isValid) errors.name = nameValidation.error || '';
    if (!emailValidation.isValid) errors.email = emailValidation.error || '';
    if (!passwordValidation.isValid) errors.password = passwordValidation.error || '';
    if (!confirmPasswordValidation.isValid)
      errors.confirmPassword = confirmPasswordValidation.error || '';
    if (!agreedToTerms) errors.terms = 'You must agree to the child-safety rules';

    setSignUpErrors(errors);
    if (Object.values(errors).some((err) => err !== '')) return;

    login(signUpEmail);
    navigate('/home');
  };

  const signInForm = (
    <form onSubmit={handleSignIn}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {signInError && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {signInError}
          </Alert>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={signInEmail}
          onChange={(e) => setSignInEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={signInPassword}
          onChange={(e) => setSignInPassword(e.target.value)}
          required
        />
        <KiddoButton type="submit" variant="contained" fullWidth size="large" glow>
          Sign In
        </KiddoButton>
      </Box>
    </form>
  );

  const signUpForm = (
    <form onSubmit={handleSignUp}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Parent/Guardian Full Name"
          fullWidth
          value={signUpName}
          onChange={(e) => setSignUpName(e.target.value)}
          error={!!signUpErrors.name}
          helperText={signUpErrors.name}
          required
        />
        <TextField
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Email
              <InfoTooltip
                title="Used for account login and recovery."
                placement="right"
                ariaLabel="Email usage"
              />
            </Box>
          }
          type="email"
          fullWidth
          value={signUpEmail}
          onChange={(e) => setSignUpEmail(e.target.value)}
          error={!!signUpErrors.email}
          helperText={signUpErrors.email}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={signUpPassword}
          onChange={(e) => setSignUpPassword(e.target.value)}
          error={!!signUpErrors.password}
          helperText={
            signUpErrors.password ||
            'Min 8 characters, at least 1 letter and 1 number'
          }
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={signUpConfirmPassword}
          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
          error={!!signUpErrors.confirmPassword}
          helperText={signUpErrors.confirmPassword}
          required
        />
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                color="primary"
              />
            }
            label="I am a parent/guardian and agree to child-safety rules"
          />
          {signUpErrors.terms && (
            <Box
              component="span"
              sx={{ display: 'block', mt: 0.5, ml: 4, color: 'error.main', fontSize: '0.75rem' }}
            >
              {signUpErrors.terms}
            </Box>
          )}
        </Box>
        <KiddoButton type="submit" variant="contained" fullWidth size="large" glow>
          Sign Up
        </KiddoButton>
      </Box>
    </form>
  );

  return (
    <AuthLayout
      title="Home Mode"
      subtitle="Parent and guardian sign in"
      tabs={[
        { label: 'Sign In', content: signInForm },
        { label: 'Sign Up', content: signUpForm },
      ]}
    />
  );
};

export default AuthHomePage;
