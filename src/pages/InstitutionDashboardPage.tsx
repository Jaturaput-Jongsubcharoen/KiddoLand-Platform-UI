import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  Users,
  BookOpen,
  LayoutDashboard,
  School,
} from 'lucide-react';
import {
  AppShellLayout,
  KiddoCard,
  KiddoButton,
  InfoTooltip,
  BannerNotice,
  ActionTile,
  GridSection,
} from '../components';

const quickActions = [
  { title: 'Generate for Class', icon: <Users /> },
  { title: 'Activity Templates', icon: <BookOpen /> },
  { title: 'Usage Summary (Aggregated)', icon: <LayoutDashboard /> },
];

export const InstitutionDashboardPage: React.FC = () => {
  return (
    <AppShellLayout>
      <Stack spacing={4}>
        <BannerNotice
          message="Institution Mode: Anonymous child sessions. No child personal info."
          severity="info"
          icon={<School size={24} />}
        />

        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Start an Anonymous Session
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Launch a guided session using age band and class context only.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoTooltip
                title="No child names; use age band + class context only."
                placement="top"
                ariaLabel="Anonymous session rules"
              />
              <KiddoButton variant="contained" color="secondary" glow>
                Start Anonymous Session
              </KiddoButton>
            </Box>
          </Stack>
        </KiddoCard>

        <GridSection title="Classroom Quick Actions">
          {quickActions.map((tile) => (
            <ActionTile
              key={tile.title}
              title={tile.title}
              icon={tile.icon}
              iconBgColor="rgba(20, 184, 166, 0.12)"
              iconColor="info.main"
            />
          ))}
        </GridSection>
      </Stack>
    </AppShellLayout>
  );
};

export default InstitutionDashboardPage;
