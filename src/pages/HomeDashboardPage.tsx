import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Music,
  Gamepad2,
  Clock,
} from 'lucide-react';
import {
  AppShellLayout,
  KiddoButton,
  KiddoCard,
  ActionTile,
  IconBadge,
  GridSection,
} from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';
import { SharedNavBar } from '../components/SharedNavBar';

const actionTiles = [
  {
    title: 'Create a Story',
    icon: <BookOpen />,
    tooltip: 'Structured inputs only: age band, interests, learning goal.',
  },
  {
    title: 'Create a Rhyme',
    icon: <Music />,
    tooltip: 'Structured inputs only: age band, interests, learning goal.',
  },
  {
    title: 'Play a Learning Activity',
    icon: <Gamepad2 />,
    tooltip: 'Structured inputs only: age band, interests, learning goal.',
  },
];

const recentItems = [
  { title: 'The Sleepy Space Turtle', time: '2 days ago' },
  { title: 'Rainbow Word Rhyme', time: 'Last week' },
  { title: 'Counting Adventure', time: 'Last week' },
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
        <KiddoCard hoverEffect={false} sx={{ p: 2.5 }}>
          <SharedNavBar />
        </KiddoCard>

        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose a structured activity. Inputs are guided by age band, interests, and learning goal.
          </Typography>
        </KiddoCard>

        <GridSection title="Quick Actions">
          {actionTiles.map((tile) => (
            <ActionTile
              key={tile.title}
              title={tile.title}
              icon={tile.icon}
              tooltip={tile.tooltip}
              onClick={
                tile.title === 'Create a Story'
                  ? () => navigate('/home/create-story')
                  : tile.title === 'Create a Rhyme'
                  ? () => navigate('/home/create-rhyme')
                  : tile.title === 'Play a Learning Activity'
                  ? () => navigate('/home/play-learning-activity')
                  : undefined
              }
            />
          ))}
        </GridSection>

        <GridSection title="Recent Items">
          {recentItems.map((item) => (
                <KiddoCard key={item.title} hoverEffect sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconBadge
                  icon={<Clock />}
                  size="small"
                  shape="rounded"
                  bgcolor="rgba(249, 115, 22, 0.12)"
                  iconColor="secondary.main"
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.time}
                  </Typography>
                </Box>
              </Stack>
            </KiddoCard>
          ))}
        </GridSection>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default HomeDashboardPage;
