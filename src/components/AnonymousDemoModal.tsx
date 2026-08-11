import React from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useApp } from '../context/AppContext';
import { KiddoButton } from './KiddoButton';

const DISMISS_KEY = 'kiddoland_anonymous_demo_dismissed';

const AnonymousDemoModal: React.FC = () => {
  const { appState } = useApp();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (appState.userRole !== 'Guest') {
      setOpen(false);
      return;
    }

    const dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    setOpen(!dismissed);
  }, [appState.userRole]);

  const handleStart = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleStart}
      fullWidth
      maxWidth="sm"
      aria-labelledby="anonymous-demo-title"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(10, 20, 40, 0.28)',
            backdropFilter: 'blur(22px) saturate(145%)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.58)',
          background:
            'linear-gradient(165deg, rgba(255,255,255,0.5) 0%, rgba(244,249,255,0.3) 100%)',
          backdropFilter: 'blur(24px) saturate(165%)',
          WebkitBackdropFilter: 'blur(24px) saturate(165%)',
          boxShadow: '0 26px 56px rgba(15,23,42,0.24)',
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 0.5,
          background: 'linear-gradient(135deg, rgba(77,150,255,0.18), rgba(20,184,166,0.14))',
        }}
      >
        <DialogTitle id="anonymous-demo-title" sx={{ px: 0, fontWeight: 800 }}>
          Welcome to KiddoLand Demo
        </DialogTitle>
        <DialogContent sx={{ px: 0, pb: 2 }}>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            You are using KiddoLand in Anonymous Demo Mode. No account is required. You can explore
            the platform and try AI story generation, rhymes, learning activities, history,
            favourites, downloads, and more right away.
          </Typography>
        </DialogContent>
      </Box>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <KiddoButton variant="contained" onClick={handleStart} size="large">
          Start Exploring
        </KiddoButton>
      </DialogActions>
    </Dialog>
  );
};

export default AnonymousDemoModal;