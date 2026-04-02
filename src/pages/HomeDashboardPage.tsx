import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Music,
  Gamepad2,
  Wand2,
} from 'lucide-react';
import {
  AppShellLayout,
  ActionTile,
  GridSection,
  RecommendedBooksSection,
} from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';

const actionTiles = [
  {
    title: 'Create a Story',
    icon: <Wand2  />,
    tooltip: 'Multiple ways to create: type, speak, upload image, or use guided form - all in one place',
    route: '/home/create-story',
  },
  {
    title: 'Create a Rhyme',
    icon: <Music />,
    tooltip: 'Create personalized rhymes and songs',
    route: '/home/create-rhyme',
  },
  {
    title: 'Play a Learning Activity',
    icon: <Gamepad2 />,
    tooltip: 'Interactive educational games',
    route: '/home/play-learning-activity',
  },
];

export const HomeDashboardPage: React.FC = () => {
  const navigate = useNavigate();

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
        <Stack spacing={4}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose how you'd like to create content for your child
          </Typography>

        <GridSection title="Quick Actions">
          {actionTiles.map((tile) => (
            <ActionTile
              key={tile.title}
              title={tile.title}
              icon={tile.icon}
              tooltip={tile.tooltip}
              onClick={() => navigate(tile.route)}
            />
          ))}
        </GridSection>

        <RecommendedBooksSection />
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default HomeDashboardPage;
