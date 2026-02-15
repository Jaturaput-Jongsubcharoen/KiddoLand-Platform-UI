import React from 'react';
import { Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { KiddoButton } from './KiddoButton';

export const SharedNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/home';
  const isHistory = location.pathname === '/home/story-history';
  const isFavorite = location.pathname === '/home/story-favorites';

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <KiddoButton
        variant={isHome ? 'contained' : 'outlined'}
        onClick={() => navigate('/home')}
      >
        Home
      </KiddoButton>
      <KiddoButton
        variant={isHistory ? 'contained' : 'outlined'}
        onClick={() => navigate('/home/story-history')}
      >
        History
      </KiddoButton>
      <KiddoButton
        variant={isFavorite ? 'contained' : 'outlined'}
        onClick={() => navigate('/home/story-favorites')}
      >
        Favourite
      </KiddoButton>
    </Stack>
  );
};

export default SharedNavBar;
