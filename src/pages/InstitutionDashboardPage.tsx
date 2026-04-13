import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Lock, Music, Wand2 } from 'lucide-react';
import {
  AppShellLayout,
  ActionTile,
  BannerNotice,
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
    title: 'Generate for Class',
    subtitle: 'AI story for your group session',
    tone: 'story',
    icon: <Wand2 size={36} strokeWidth={2.25} />,
    tooltip:
      'Create a story tailored to your class: age band, subject area, session setting — no child names stored.',
    route: '/institution/create-story',
  },
  {
    title: 'Create a Class Rhyme',
    subtitle: 'Songs & rhymes for the whole group',
    tone: 'rhyme',
    icon: <Music size={36} strokeWidth={2.25} />,
    tooltip:
      'Generate a playful rhyme for the class — choose age band, style, topic, and learning focus. No individual names needed.',
    route: '/institution/create-rhyme',
  },
  {
    title: 'Learning Activity Quiz',
    subtitle: 'Pick a theme & play a quiz',
    tone: 'play',
    icon: <Gamepad2 size={36} strokeWidth={2.25} />,
    tooltip:
      'Generate a 5-question kid-friendly quiz for the class. Choose theme, age band, and difficulty.',
    route: '/institution/play-learning-activity',
  },
];

export const InstitutionDashboardPage: React.FC = () => {
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
          {/* ── Privacy banner ─────────────────────── */}
          <BannerNotice
            message="Institution Mode — anonymous sessions only. No child names or personal data are stored."
            severity="info"
            icon={<Lock size={20} />}
          />

          {/* ── Hero ───────────────────────────────── */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 0.75,
                fontFamily: '"Fredoka", "Nunito", sans-serif',
                background: 'linear-gradient(135deg, #0f766e 0%, #1D4ED8 50%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome, {userName}! 👋
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 500, lineHeight: 1.7, maxWidth: 540 }}
            >
              Start an anonymous classroom session — generate a story or run a quiz using age band
              and class context only.
            </Typography>
          </Box>

          {/* ── Quick Actions ──────────────────────── */}
          <GridSection title="Classroom Activities">
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

          {/* ── Book Recommendations ───────────────── */}
          <RecommendedBooksSection sectionTitle="Recommended for Your Class 📚" />
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default InstitutionDashboardPage;
