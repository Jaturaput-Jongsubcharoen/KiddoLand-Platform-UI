import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Alert,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  KiddoButton,
  InfoTooltip,
  AuthLayout,
  BannerNotice,
} from '../components';
import { loginWithPassword } from '../utils/authApi';
import {
  validateInstitutionEmail,
  validateName,
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

  const [requestName, setRequestName] = useState('');
  const [requestInstitution, setRequestInstitution] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestRole, setRequestRole] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [requestErrors, setRequestErrors] = useState({
    name: '',
    institution: '',
    email: '',
    role: '',
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
      login(signInEmail, response.access_token, response.role, tokenExpiresAt);
      navigate('/institution');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setSignInError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { name: '', institution: '', email: '', role: '' };

    const nameValidation = validateName(requestName);
    const institutionValidation = validateName(requestInstitution);
    const emailValidation = validateInstitutionEmail(requestEmail);

    if (!nameValidation.isValid) errors.name = nameValidation.error || '';
    if (!institutionValidation.isValid) errors.institution = 'Institution name is required';
    if (!emailValidation.isValid) errors.email = emailValidation.error || '';
    if (!requestRole) errors.role = 'Please select a role';

    setRequestErrors(errors);
    if (Object.values(errors).some((err) => err !== '')) return;

    openSuccessSnackbar();
    setRequestName('');
    setRequestInstitution('');
    setRequestEmail('');
    setRequestRole('');
    setRequestNote('');
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
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Work/Institution Email
              <InfoTooltip
                title="Must be an educational or organization email. Personal emails are not allowed."
                placement="right"
                ariaLabel="Institution email info"
              />
            </Box>
          }
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

  const requestAccessForm = (
    <form onSubmit={handleRequestAccess}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Full Name"
          fullWidth
          value={requestName}
          onChange={(e) => setRequestName(e.target.value)}
          error={!!requestErrors.name}
          helperText={requestErrors.name}
          required
        />
        <TextField
          label="Institution Name"
          fullWidth
          value={requestInstitution}
          onChange={(e) => setRequestInstitution(e.target.value)}
          error={!!requestErrors.institution}
          helperText={requestErrors.institution}
          required
        />
        <TextField
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Institution Email
              <InfoTooltip
                title="Must be an approved school/library email domain."
                placement="right"
                ariaLabel="Institution email rules"
              />
            </Box>
          }
          type="email"
          fullWidth
          value={requestEmail}
          onChange={(e) => setRequestEmail(e.target.value)}
          error={!!requestErrors.email}
          helperText={requestErrors.email}
          required
        />
        <TextField
          select
          label="Role"
          fullWidth
          value={requestRole}
          onChange={(e) => setRequestRole(e.target.value)}
          error={!!requestErrors.role}
          helperText={requestErrors.role}
          required
        >
          <MenuItem value="teacher">Teacher</MenuItem>
          <MenuItem value="librarian">Librarian</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
        <TextField
          label="Short Note (Optional)"
          fullWidth
          multiline
          rows={3}
          value={requestNote}
          onChange={(e) => setRequestNote(e.target.value)}
        />
        <KiddoButton type="submit" variant="contained" color="secondary" fullWidth size="large" glow>
          Submit Request
        </KiddoButton>
      </Box>
    </form>
  );

  const banner = (
    <BannerNotice
      message="Institution Mode: Anonymous child sessions. No child personal info."
      severity="info"
      icon={<School size={24} />}
    />
  );

  return (
    <>
      <AuthLayout
        title="Institution Mode"
        subtitle="Staff-only access for teachers and librarians"
        banner={banner}
        tabs={[
          { label: 'Sign In', content: signInForm },
          { label: 'Request Access', content: requestAccessForm },
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
          Request submitted (demo).
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthInstitutionPage;
