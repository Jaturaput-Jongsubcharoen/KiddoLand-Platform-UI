import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Alert,
  MenuItem,
  Snackbar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  KiddoButton,
  AuthLayout,
} from '../components';
import { loginWithPassword, registerWithPassword, getUserProfile } from '../utils/authApi';
import {
  resolveNameFromAuthResponse,
  resolveNameFromProfile,
  fallbackNameFromEmail,
} from '../utils/userName';
import {
  validateInstitutionEmail,
  validateName,
  validatePassword,
  validateConfirmPassword,
} from '../utils/formValidators';
import { useToggle } from '../hooks';

export const AuthInstitutionPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, setMode, appState } = useApp();
  const [showRequestSuccess, { setTrue: openSuccessSnackbar, setFalse: closeSuccessSnackbar }] = useToggle();

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpInstitution, setSignUpInstitution] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpErrorMsg, setSignUpErrorMsg] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [signUpErrors, setSignUpErrors] = useState({
    name: '',
    institution: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (appState.selectedMode !== 'institution') {
      setMode('institution');
    }
  }, [appState.selectedMode, setMode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const emailValidation = validateInstitutionEmail(signInEmail);
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
        mode: 'institution',
      });
      const tokenExpiresAt = Date.now() + response.expires_in * 1000;

      let userName = resolveNameFromAuthResponse(response);
      // Try to get user profile to fetch their name
      try {
        const profile = await getUserProfile(response.access_token);
        const profileName = resolveNameFromProfile(profile);
        if (!userName && profileName) {
          userName = profileName;
        }
      } catch (profileError) {
        console.warn('Could not fetch user profile:', profileError);
        // Continue with login even if profile fetch fails
      }

      const emailForFallback = response.email || signInEmail;
      const fallbackName = fallbackNameFromEmail(emailForFallback);
      const finalUserName = (userName && userName.trim()) || fallbackName;

      login(signInEmail, response.access_token, response.role, tokenExpiresAt, finalUserName, response.plan);
      navigate('/institution');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setSignInError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrorMsg('');

    const errors = { name: '', institution: '', email: '', role: '', password: '', confirmPassword: '' };

    const nameValidation = validateName(signUpName);
    const institutionValidation = validateName(signUpInstitution);
    const emailValidation = validateInstitutionEmail(signUpEmail);
    const passwordValidation = validatePassword(signUpPassword);
    const confirmPasswordValidation = validateConfirmPassword(signUpPassword, signUpConfirmPassword);

    if (!nameValidation.isValid) errors.name = nameValidation.error || '';
    if (!institutionValidation.isValid) errors.institution = 'Institution name is required';
    if (!emailValidation.isValid) errors.email = emailValidation.error || '';
    if (!signUpRole) errors.role = 'Please select a role';
    if (!passwordValidation.isValid) errors.password = passwordValidation.error || '';
    if (!confirmPasswordValidation.isValid) errors.confirmPassword = confirmPasswordValidation.error || '';

    setSignUpErrors(errors);
    if (Object.values(errors).some((err) => err !== '')) return;

    // Map frontend role value to backend expected casing
    const roleMap: Record<string, string> = {
      teacher: 'Teacher',
      librarian: 'Librarian',
      admin: 'Admin',
    };
    const selectedRole = roleMap[signUpRole] || signUpRole;

    try {
      setIsSigningUp(true);
      const resp = await registerWithPassword({
        email: signUpEmail,
        name: signUpName,
        password: signUpPassword,
        mode: 'institution',
        role: selectedRole as any,
      });

      const tokenExpiresAt = Date.now() + resp.expires_in * 1000;
      // Try fetching profile
      const responseName = resolveNameFromAuthResponse(resp);
      let userName = responseName || signUpName;
      try {
        const profile = await getUserProfile(resp.access_token);
        const profileName = resolveNameFromProfile(profile);
        if (!userName && profileName) {
          userName = profileName;
        }
      } catch (profileErr) {
        console.warn('Could not fetch profile after register:', profileErr);
      }

      const emailForFallback = resp.email || signUpEmail;
      const fallbackName = fallbackNameFromEmail(emailForFallback);
      const finalUserName = (userName && userName.trim()) || fallbackName;

      login(signUpEmail, resp.access_token, resp.role, tokenExpiresAt, finalUserName, resp.plan);
      navigate('/institution');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign up.';
      setSignUpErrorMsg(message);
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
          label="Work/Institution Email"
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
          autoComplete="current-password"
          sx={{
            '& input[type="password"]::-ms-reveal': { display: 'none' },
            '& input[type="password"]::-ms-clear': { display: 'none' },
          }}
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
          color="secondary"
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
        {signUpErrorMsg && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {signUpErrorMsg}
          </Alert>
        )}
        <TextField
          label="Full Name"
          fullWidth
          value={signUpName}
          onChange={(e) => setSignUpName(e.target.value)}
          error={!!signUpErrors.name}
          helperText={signUpErrors.name}
          required
        />
        <TextField
          label="Institution Name"
          fullWidth
          value={signUpInstitution}
          onChange={(e) => setSignUpInstitution(e.target.value)}
          error={!!signUpErrors.institution}
          helperText={signUpErrors.institution}
          required
        />
        <TextField
          label="Institution Email"
          type="email"
          fullWidth
          value={signUpEmail}
          onChange={(e) => setSignUpEmail(e.target.value)}
          error={!!signUpErrors.email}
          helperText={signUpErrors.email}
          required
        />
        <FormControl fullWidth required error={!!signUpErrors.role}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            id="role-select"
            value={signUpRole}
            label="Role"
            onChange={(e) => setSignUpRole(e.target.value)}
            MenuProps={{ disableAutoFocusItem: true }}
          >
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="librarian">Librarian</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
          {signUpErrors.role && <FormHelperText>{signUpErrors.role}</FormHelperText>}
        </FormControl>
        <TextField
          label="Password"
          type={showSignUpPassword ? 'text' : 'password'}
          fullWidth
          value={signUpPassword}
          onChange={(e) => setSignUpPassword(e.target.value)}
          error={!!signUpErrors.password}
          helperText={signUpErrors.password || 'Min 8 characters, at least 1 letter and 1 number'}
          required
          autoComplete="new-password"
          sx={{
            '& input[type="password"]::-ms-reveal': { display: 'none' },
            '& input[type="password"]::-ms-clear': { display: 'none' },
          }}
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
          autoComplete="new-password"
          sx={{
            '& input[type="password"]::-ms-reveal': { display: 'none' },
            '& input[type="password"]::-ms-clear': { display: 'none' },
          }}
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
        <KiddoButton type="submit" variant="contained" color="secondary" fullWidth size="large" glow>
          Sign Up
        </KiddoButton>
      </Box>
    </form>
  );

  return (
    <>
      <AuthLayout
        title="Institution Mode"
        subtitle="Staff-only access for teachers and librarians"
        tabs={[
          { label: 'Sign In', content: signInForm },
          { label: 'Sign Up', content: signUpForm },
        ]}
        maxWidth={560}
      />

      <Snackbar
        open={showRequestSuccess}
        autoHideDuration={3000}
        onClose={closeSuccessSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 3 }} onClose={closeSuccessSnackbar}>
          Sign up successful! (demo)
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthInstitutionPage;
