import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AppShellLayout, KiddoCard } from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';
import BackButton from '../components/BackButton';

const CreateRhymePage: React.FC = () => {
  return (
    <AppShellLayout>
      {/* Background Scene Layer - 35% opacity for ambient feel */}
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
      {/* Content Layer */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={2}>
          <Box>
            <BackButton />
          </Box>
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Create a Rhyme
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

export default CreateRhymePage;
