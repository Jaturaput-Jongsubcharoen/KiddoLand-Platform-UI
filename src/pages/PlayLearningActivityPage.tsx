import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AppShellLayout, KiddoCard } from '../components';
import { SharedNavBar } from '../components/SharedNavBar';
import { LearningWorldScene } from '../components/LearningWorldScene';
import BackButton from '../components/BackButton';

const PlayLearningActivityPage: React.FC = () => {
  return (
    <AppShellLayout>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        <LearningWorldScene />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4}>
          <KiddoCard hoverEffect={false} sx={{ p: 2.5 }}>
            <SharedNavBar />
          </KiddoCard>

          <Box>
            <BackButton />
          </Box>

          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Play a Learning Activity
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Coming soon.
            </Typography>
          </KiddoCard>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default PlayLearningActivityPage;
