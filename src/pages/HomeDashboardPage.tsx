import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Music, Wand2 } from 'lucide-react';
import {
  AppShellLayout,
  ActionTile,
  GridSection,
  RecommendedBooksSection,
  type ActionTileTone,
} from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';
import { useApp } from '../context/AppContext';

const actionTiles: {
  title: string;
  subtitle: string;
  tone: ActionTileTone;
  icon: React.ReactNode;
  tooltip: string;
  route: string;
}[] = [
  {
    title: 'Create a Story',
    subtitle: 'Type, speak, or add a photo',
    tone: 'story',
    icon: <Wand2 size={36} strokeWidth={2.25} />,
    tooltip:
      'Multiple ways to create: type, speak, upload an image, or use guided prompts — all in one place.',
    route: '/home/create-story',
  },
  {
    title: 'Create a Rhyme',
    subtitle: 'Fun songs & nursery rhymes',
    tone: 'rhyme',
    icon: <Music size={36} strokeWidth={2.25} />,
    tooltip: 'Generate a personalized rhyme or sing-along for bedtime, playtime, or any moment.',
    route: '/home/create-rhyme',
  },
  {
    title: 'Play a Quiz',
    subtitle: 'Short, playful learning activity',
    tone: 'play',
    icon: <Gamepad2 size={36} strokeWidth={2.25} />,
    tooltip:
      'Pick a theme and age band — the AI creates 5 colorful quiz questions, shuffled fresh every time.',
    route: '/home/play-learning-activity',
  },
];

export const HomeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { appState } = useApp();
  const userName =
    appState.userName?.trim() ||
    (appState.userEmail ? appState.userEmail.split('@')[0] : '') ||
    'there';

  return (
    <AppShellLayout>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          opacity: 0.38,
          pointerEvents: 'none',
        }}
      >
        <LearningWorldScene />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4}>
          {/* ── Hero ─────────────────────────────── */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 0.75,
                fontFamily: '"Nunito", sans-serif',
                background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 45%, #F97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome, {userName}! 🌟
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 900, lineHeight: 1.7, maxWidth: 500 }}
            >
              Ready to create something magical today? Pick an activity below and let's get started.
            </Typography>
          </Box>

          {/* ── Quick Actions ─────────────────────── */}
          <GridSection title="What would you like to do?">
            {actionTiles.map((tile) => (
              <ActionTile
                key={tile.title}
                title={tile.title}
                subtitle={tile.subtitle}
                tone={tile.tone}
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
