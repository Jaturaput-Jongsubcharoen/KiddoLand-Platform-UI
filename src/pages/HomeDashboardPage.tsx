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
  KiddoCard,
  ActionTile,
  IconBadge,
  GridSection,
} from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';

const actionTiles = [
  {
    title: 'Create a Story',
    icon: <BookOpen />,
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
        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose how you'd like to create content for your child
          </Typography>
        </KiddoCard>

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
