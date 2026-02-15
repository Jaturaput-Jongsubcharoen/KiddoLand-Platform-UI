import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { KiddoButton, AuthLayout } from '../components';
import { loginWithPassword, registerWithPassword } from '../utils/authApi';
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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
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

  const handleSignIn = async (e: React.FormEvent) => {
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

    try {
      setIsSigningIn(true);
      // Jaturaput Jongsubcharoen: wire login to backend auth.
      const response = await loginWithPassword({
        email: signInEmail,
        password: signInPassword,
        mode: 'home',
      });
      const tokenExpiresAt = Date.now() + response.expires_in * 1000;
      login(signInEmail, response.access_token, response.role, tokenExpiresAt);
      localStorage.setItem('accessToken', response.access_token);
      navigate('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setSignInError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
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

    try {
      setIsSigningUp(true);
      // Jaturaput Jongsubcharoen: wire registration to backend auth.
      const response = await registerWithPassword({
        email: signUpEmail,
        password: signUpPassword,
        mode: 'home',
        role: 'Parent',
      });
      const tokenExpiresAt = Date.now() + response.expires_in * 1000;
      login(signUpEmail, response.access_token, response.role, tokenExpiresAt);
      localStorage.setItem('accessToken', response.access_token);
      navigate('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign up.';
      setSignUpError(message);
    } finally {
      setIsSigningUp(false);
    }
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
          type={showSignInPassword ? 'text' : 'password'}
          fullWidth
          value={signInPassword}
          onChange={(e) => setSignInPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showSignInPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <KiddoButton
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          glow
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Signing In...' : 'Sign In'}
        </KiddoButton>
      </Box>
    </form>
  );

  const signUpForm = (
    <form onSubmit={handleSignUp}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {signUpError && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {signUpError}
          </Alert>
        )}
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
          label="Email"
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
          type={showSignUpPassword ? 'text' : 'password'}
          fullWidth
          value={signUpPassword}
          onChange={(e) => setSignUpPassword(e.target.value)}
          error={!!signUpErrors.password}
          helperText={
            signUpErrors.password ||
            'Min 8 characters, at least 1 letter and 1 number'
          }
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showSignUpPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          type={showSignUpConfirmPassword ? 'text' : 'password'}
          fullWidth
          value={signUpConfirmPassword}
          onChange={(e) => setSignUpConfirmPassword(e.target.value)}
          error={!!signUpErrors.confirmPassword}
          helperText={signUpErrors.confirmPassword}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                  edge="end"
                  aria-label="toggle confirm password visibility"
                >
                  {showSignUpConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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
        <KiddoButton
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          glow
          disabled={isSigningUp}
        >
          {isSigningUp ? 'Signing Up...' : 'Sign Up'}
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
