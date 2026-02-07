import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  Home,
  School,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  KiddoCard,
  KiddoButton,
  InfoTooltip,
  AppShellLayout,
  IconBadge,
  KiddoModal,
} from '../components';
import { gradientText } from '../theme/utilities';
import { useToggle } from '../hooks';

type ModeType = 'home' | 'institution' | null;

export const ModeSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { setMode } = useApp();
  const [selectedMode, setSelectedMode] = useState<ModeType>(null);
  const [showInfoModal, { setTrue: openInfoModal, setFalse: closeInfoModal }] = useToggle();

  const handleModeSelect = (mode: ModeType) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      setMode(selectedMode);
      navigate(`/auth/${selectedMode}`);
    }
  };

  return (
    <AppShellLayout showNav={false}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 128px)',
          textAlign: 'center',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              ...gradientText.primary,
            }}
          >
            Welcome to KiddoLand
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            A Child-Safe AI Personalization Engine for Adaptive Literacy
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Choose your mode to get started
            </Typography>
            <InfoTooltip
              title="We need to know how you'll use KiddoLand to ensure proper privacy and safety controls."
              placement="right"
            />
          </Box>
        </Box>

        {/* Mode Selection Cards */}
        <Grid container spacing={4} sx={{ maxWidth: 900, mb: 4 }}>
          {/* Home Mode Card */}
          <Grid item xs={12} md={6}>
            <KiddoCard
              hoverEffect={true}
              sx={{
                height: '100%',
                border: selectedMode === 'home' ? 3 : 0,
                borderColor: 'primary.main',
                position: 'relative',
              }}
            >
              <CardActionArea
                onClick={() => handleModeSelect('home')}
                sx={{
                  height: '100%',
                  p: 4,
                }}
              >
                <CardContent>
                  {selectedMode === 'home' && (
                    <CheckCircle
                      size={40}
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: '#1D4ED8',
                      }}
                    />
                  )}
                  <IconBadge
                    icon={<Home />}
                    size="large"
                    bgcolor="primary.light"
                    iconColor="primary.main"
                    centered
                    sx={{ mb: 3 }}
                  />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Home Mode
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    For Parents & Guardians
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create personalized stories, rhymes, and activities for your child. 
                    Manage favorites and track progress.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </KiddoCard>
          </Grid>

          {/* Institution Mode Card */}
          <Grid item xs={12} md={6}>
            <KiddoCard
              hoverEffect={true}
              sx={{
                height: '100%',
                border: selectedMode === 'institution' ? 3 : 0,
                borderColor: 'secondary.main',
                position: 'relative',
              }}
            >
              <CardActionArea
                onClick={() => handleModeSelect('institution')}
                sx={{
                  height: '100%',
                  p: 4,
                }}
              >
                <CardContent>
                  {selectedMode === 'institution' && (
                    <CheckCircle
                      size={40}
                      style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: '#14B8A6',
                      }}
                    />
                  )}
                  <IconBadge
                    icon={<School />}
                    size="large"
                    bgcolor="secondary.light"
                    iconColor="secondary.main"
                    centered
                    sx={{ mb: 3 }}
                  />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Institution Mode
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    For Teachers & Librarians
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Anonymous child sessions with enhanced privacy. Generate content 
                    for classrooms and library programs.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </KiddoCard>
          </Grid>
        </Grid>

        {/* Continue Button */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <KiddoButton
            variant="contained"
            size="large"
            disabled={!selectedMode}
            onClick={handleContinue}
            glow={!!selectedMode}
            sx={{
              minWidth: 200,
            }}
          >
            Continue
          </KiddoButton>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
            onClick={openInfoModal}
          >
            Why we ask this?
          </Typography>
        </Box>

        {/* Info Modal */}
        <KiddoModal
          open={showInfoModal}
          onClose={closeInfoModal}
          title="Understanding Modes"
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              <Home size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Home Mode
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Parent-managed accounts with optional favorites and history
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Store personalized content for your child
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Download content for offline use
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="secondary" gutterBottom>
              <School size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Institution Mode
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Staff-only access (teachers, librarians, admins)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Anonymous child sessions - no child personal information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Stricter privacy policies and content controls
            </Typography>
          </Box>
        </KiddoModal>
      </Box>
    </AppShellLayout>
  );
};

export default ModeSelectPage;
