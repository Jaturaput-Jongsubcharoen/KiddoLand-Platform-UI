import React, { useState } from 'react';
import { Box, Tabs, Tab, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { KiddoCard } from '../KiddoCard';
import { PageHeader } from '../ui/PageHeader';
import { AppShellLayout } from '../AppShellLayout';
import { useApp } from '../../context/AppContext';

interface AuthTab {
  label: string;
  content: React.ReactNode;
}

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  banner?: React.ReactNode;
  tabs: AuthTab[];
  maxWidth?: number;
  onSwitchMode?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  banner,
  tabs,
  maxWidth = 520,
  onSwitchMode,
}) => {
  const navigate = useNavigate();
  const { setMode } = useApp();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSwitchMode = () => {
    if (onSwitchMode) {
      onSwitchMode();
    } else {
      setMode(null);
      navigate('/');
    }
  };

  return (
    <AppShellLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        {banner && (
          <Box sx={{ maxWidth: maxWidth + 40, width: '100%', mb: 3 }}>
            {banner}
          </Box>
        )}

        <KiddoCard
          hoverEffect={false}
          sx={{
            maxWidth,
            width: '100%',
            p: 4,
          }}
        >
          <PageHeader title={title} subtitle={subtitle} align="center" />

          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>

          {tabs[tabValue]?.content}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleSwitchMode}
              sx={{ cursor: 'pointer' }}
            >
              Switch Mode
            </Link>
          </Box>
        </KiddoCard>
      </Box>
    </AppShellLayout>
  );
};

export default AuthLayout;
