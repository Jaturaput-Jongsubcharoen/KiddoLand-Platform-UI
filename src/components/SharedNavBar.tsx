import React from 'react';
import { Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { KiddoButton } from './KiddoButton';
import { useApp } from '../context/AppContext';

export const SharedNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appState } = useApp();
  const isInstitution = appState.selectedMode === 'institution';

  const isHomeDash = isInstitution
    ? location.pathname === '/institution'
    : location.pathname === '/home';
  const isCreateStory = location.pathname === '/institution/create-story';
  const isHistory = location.pathname === '/story-history';
  const isFavorite = location.pathname === '/story-favorites';

  if (isInstitution) {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <KiddoButton
          variant={isHomeDash ? 'contained' : 'outlined'}
          onClick={() => navigate('/institution')}
        >
          Dashboard
        </KiddoButton>
        <KiddoButton
          variant={isCreateStory ? 'contained' : 'outlined'}
          onClick={() => navigate('/institution/create-story')}
        >
          Create story
        </KiddoButton>
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <KiddoButton
        variant={isHomeDash ? 'contained' : 'outlined'}
        onClick={() => navigate('/home')}
      >
        Home
      </KiddoButton>
      <KiddoButton
        variant={isHistory ? 'contained' : 'outlined'}
        onClick={() => navigate('/story-history')}
      >
        History
      </KiddoButton>
      <KiddoButton
        variant={isFavorite ? 'contained' : 'outlined'}
        onClick={() => navigate('/story-favorites')}
      >
        Favourite
      </KiddoButton>
    </Stack>
  );
};

export default SharedNavBar;
