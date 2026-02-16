import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CardContent,
  CardActionArea,
  Stack,
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
  AppShellLayout,
  IconBadge,
  KiddoModal,
  LearningWorldScene,
} from '../components';
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
      {/* Learning World Scene Background */}
      <LearningWorldScene />

      {/* Main Content Layer */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 128px)',
          textAlign: 'center',
          px: 2,
          pt: 3, // Slight top padding to lower hero for better balance
        }}
      >
        {/* Hero Section - Kid-Friendly Welcome Banner */}
        <Box
          sx={{
            mb: 6,
            // Playful gradient background - fully opaque for visibility
            background: 'linear-gradient(135deg, #FFF5F5 0%, #F5FAFF 50%, #FAF5FF 100%)',
            backdropFilter: 'blur(12px)',
            borderRadius: 3.5, // 28px - friendly but not too circular
            border: 'none',
            
            // Elevated shadow with colorful tint
            boxShadow: `
              0 20px 60px rgba(255, 107, 157, 0.12),
              0 8px 32px rgba(77, 150, 255, 0.08),
              0 2px 8px rgba(155, 114, 203, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 1)
            `,
            
            px: { xs: 3, md: 5 },
            py: { xs: 2.5, md: 3.5 },
            position: 'relative',
            maxWidth: 720,
            textAlign: 'center',
            overflow: 'hidden',
            
            // Colorful glow with stronger presence
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -3,
              borderRadius: 3.5,
              background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.25), rgba(77, 150, 255, 0.25), rgba(155, 114, 203, 0.25))',
              filter: 'blur(12px)',
              opacity: 0.6,
              zIndex: -1,
              pointerEvents: 'none',
            },
            
            // Playful dots pattern
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 3.5,
              backgroundImage: 'radial-gradient(circle, rgba(255, 107, 157, 0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
              opacity: 0.4,
            },
          }}
        >
          {/* Decorative sparkles */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 20,
              fontSize: '1.5rem',
              animation: 'sparkleRotate 3s linear infinite',
              opacity: 0.7,
            }}
          >
            ⭐
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 24,
              fontSize: '1.3rem',
              animation: 'sparkleRotate 3s linear infinite reverse',
              opacity: 0.7,
            }}
          >
            🌟
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 28,
              fontSize: '1.2rem',
              animation: 'sparkleRotate 4s linear infinite',
              opacity: 0.6,
            }}
          >
            💫
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontSize: '1.4rem',
              animation: 'sparkleRotate 4s linear infinite reverse',
              opacity: 0.6,
            }}
          >
            ✨
          </Box>

          {/* Title with vibrant gradient */}
          <Typography
            variant="h1"
            sx={{
              mb: 1.2,
              fontSize: { xs: '2.3rem', md: '3rem' },
              background: 'linear-gradient(135deg, #FF6B9D 0%, #4D96FF 50%, #9B72CB 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 2px 20px rgba(77, 150, 255, 0.1)',
            }}
          >
            Hi! Welcome to KiddoLand! ✨
          </Typography>

          {/* Subtitle with vibrant solid color */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: '#FF6B42', // Vibrant coral-orange
              lineHeight: 1.3,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Your Brain's Secret Adventure Begins!
            </Typography>
        </Box>

        {/* Where You're Learning - Destination Cards */}
        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ maxWidth: 920, mb: 5 }}>
          {/* Home Card */}
          <Grid item xs={12} md={6}>
            <KiddoCard
              hoverEffect={false}
              sx={{
                height: '100%',
                minHeight: 'auto',
                border: selectedMode === 'home' ? '4px solid' : '2px solid',
                borderColor: selectedMode === 'home' ? '#4D96FF' : 'rgba(77, 150, 255, 0.25)',
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                // Warmer, more vibrant background
                background: selectedMode === 'home'
                  ? 'linear-gradient(135deg, #EBF5FF 0%, #F0F8FF 100%)'
                  : 'linear-gradient(135deg, #F8FBFF 0%, #FFFFFF 100%)',
                transform: selectedMode === 'home' ? 'scale(1.03)' : 'scale(1)',
                boxShadow: selectedMode === 'home'
                  ? '0 12px 40px rgba(77, 150, 255, 0.35), 0 0 0 6px rgba(77, 150, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  : '0 6px 20px rgba(77, 150, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                // Subtle dot pattern
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 3,
                  backgroundImage: 'radial-gradient(circle, rgba(77, 150, 255, 0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                  opacity: 0.4,
                },
                '&:hover': {
                  transform: selectedMode === 'home' ? 'scale(1.03)' : 'scale(1.03)',
                  boxShadow: selectedMode === 'home'
                    ? '0 14px 45px rgba(77, 150, 255, 0.4), 0 0 0 6px rgba(77, 150, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
                    : '0 10px 32px rgba(77, 150, 255, 0.2), 0 0 0 3px rgba(77, 150, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                  borderColor: '#4D96FF',
                  background: 'linear-gradient(135deg, #EBF5FF 0%, #F0F8FF 100%)',
                },
                // Subtle sparkle when selected
                ...(selectedMode === 'home' && {
                  '&::after': {
                    content: '"✨"',
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    fontSize: '1.3rem',
                    animation: 'sparkleRotate 3s ease-in-out infinite',
                    opacity: 0.9,
                    zIndex: 2,
                  },
                }),
              }}
            >
              <CardActionArea
                onClick={() => handleModeSelect('home')}
                aria-pressed={selectedMode === 'home'}
                aria-label="Select learning at home mode for parents and guardians"
                sx={{
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  '&:focus-visible': {
                    outline: '3px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <CardContent sx={{ width: '100%', p: 0, '&:last-child': { pb: 0 } }}>
                  {/* Selected checkmark */}
                  {selectedMode === 'home' && (
                    <CheckCircle
                      size={28}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: '#4D96FF',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      }}
                    />
                  )}

                  {/* Icon - Elegant */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                    }}
                  >
                  <IconBadge
                    icon={<Home />}
                    size="large"
                    centered
                      sx={{
                        width: 70,
                        height: 70,
                        background: 'linear-gradient(135deg, #60A5FA 0%, #4D96FF 100%)',
                        boxShadow: selectedMode === 'home' 
                          ? '0 6px 20px rgba(77, 150, 255, 0.4)' 
                          : '0 4px 16px rgba(77, 150, 255, 0.25)',
                        border: '2px solid #FFFFFF',
                        transition: 'all 0.3s ease',
                        '& > svg': { fontSize: '2.2rem' },
                      }}
                  />
                  </Box>

                  {/* Title - Bigger & Bolder */}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '1.9rem', md: '2.1rem' },
                      textAlign: 'center',
                      mb: 2,
                      color: '#1E40AF',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    At Home 🏠
                  </Typography>

                  {/* Simple, clear description */}
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      color: 'text.secondary',
                      px: 1,
                    }}
                  >
                    Personalized stories, rhymes, and activities made just for your child.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </KiddoCard>
          </Grid>

          {/* School Card */}
          <Grid item xs={12} md={6}>
            <KiddoCard
              hoverEffect={false}
              sx={{
                height: '100%',
                minHeight: 'auto',
                border: selectedMode === 'institution' ? '4px solid' : '2px solid',
                borderColor: selectedMode === 'institution' ? '#FF8C42' : 'rgba(255, 140, 66, 0.25)',
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer',
                // Warmer, more vibrant background
                background: selectedMode === 'institution'
                  ? 'linear-gradient(135deg, #FFF4E6 0%, #FFF9F0 100%)'
                  : 'linear-gradient(135deg, #FFFBF5 0%, #FFFFFF 100%)',
                transform: selectedMode === 'institution' ? 'scale(1.03)' : 'scale(1)',
                boxShadow: selectedMode === 'institution'
                  ? '0 12px 40px rgba(255, 140, 66, 0.35), 0 0 0 6px rgba(255, 140, 66, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  : '0 6px 20px rgba(255, 140, 66, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                // Subtle dot pattern
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 3,
                  backgroundImage: 'radial-gradient(circle, rgba(255, 140, 66, 0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                  opacity: 0.4,
                },
                '&:hover': {
                  transform: selectedMode === 'institution' ? 'scale(1.03)' : 'scale(1.03)',
                  boxShadow: selectedMode === 'institution'
                    ? '0 14px 45px rgba(255, 140, 66, 0.4), 0 0 0 6px rgba(255, 140, 66, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
                    : '0 10px 32px rgba(255, 140, 66, 0.2), 0 0 0 3px rgba(255, 140, 66, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                  borderColor: '#FF8C42',
                  background: 'linear-gradient(135deg, #FFF4E6 0%, #FFF9F0 100%)',
                },
                // Subtle sparkle when selected
                ...(selectedMode === 'institution' && {
                  '&::after': {
                    content: '"✨"',
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    fontSize: '1.3rem',
                    animation: 'sparkleRotate 3s ease-in-out infinite',
                    opacity: 0.9,
                    zIndex: 2,
                  },
                }),
              }}
            >
              <CardActionArea
                onClick={() => handleModeSelect('institution')}
                aria-pressed={selectedMode === 'institution'}
                aria-label="Select learning at school mode for teachers and librarians"
                sx={{
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  '&:focus-visible': {
                    outline: '3px solid',
                    outlineColor: 'secondary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <CardContent sx={{ width: '100%', p: 0, '&:last-child': { pb: 0 } }}>
                  {/* Selected checkmark */}
                  {selectedMode === 'institution' && (
                    <CheckCircle
                      size={28}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: '#FF8C42',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      }}
                    />
                  )}

                  {/* Icon - Elegant */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                    }}
                  >
                  <IconBadge
                    icon={<School />}
                    size="large"
                    centered
                      sx={{
                        width: 70,
                        height: 70,
                        background: 'linear-gradient(135deg, #FDBA74 0%, #FF8C42 100%)',
                        boxShadow: selectedMode === 'institution' 
                          ? '0 6px 20px rgba(255, 140, 66, 0.4)' 
                          : '0 4px 16px rgba(255, 140, 66, 0.25)',
                        border: '2px solid #FFFFFF',
                        transition: 'all 0.3s ease',
                        '& > svg': { fontSize: '2.2rem' },
                      }}
                  />
                  </Box>

                  {/* Title - Bigger & Bolder */}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '1.9rem', md: '2.1rem' },
                      textAlign: 'center',
                      mb: 2,
                      color: '#C2410C',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    At School 🏫
                  </Typography>

                  {/* Simple, clear description */}
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                      color: 'text.secondary',
                      px: 1,
                    }}
                  >
                    Safe, classroom-ready content designed for teachers.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </KiddoCard>
          </Grid>
        </Grid>

        {/* Start Learning Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', maxWidth: 500 }}>
          <KiddoButton
            variant="contained"
            size="large"
            disabled={!selectedMode}
            onClick={handleContinue}
            glow={!!selectedMode}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 280 },
              minHeight: 56,
              fontSize: '1.3rem',
              py: 2,
              px: 5,
              background: selectedMode
                ? 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 50%, #9B72CB 100%)'
                : 'linear-gradient(135deg, #E8E8E8 0%, #C4C4C4 100%)',
              boxShadow: selectedMode
                ? '0 8px 0 #3A7D44, 0 12px 30px rgba(107, 203, 119, 0.4)'
                : '0 4px 0 #9E9E9E, 0 8px 15px rgba(0, 0, 0, 0.15)',
              borderRadius: 7,
              transform: 'translateY(0)',
              transition: 'all 0.15s ease',
              animation: selectedMode ? 'subtlePulse 2s ease-in-out infinite' : 'none',
              '@keyframes subtlePulse': {
                '0%, 100%': {
                  transform: 'translateY(0) scale(1)',
                },
                '50%': {
                  transform: 'translateY(0) scale(1.02)',
                },
              },
              '&:hover': selectedMode
                ? {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 10px 0 #3A7D44, 0 14px 35px rgba(107, 203, 119, 0.5)',
                    animation: 'none',
                  }
                : undefined,
              '&:active': selectedMode
                ? {
                    transform: 'translateY(4px) scale(0.98)',
                    boxShadow: '0 4px 0 #3A7D44, 0 6px 20px rgba(107, 203, 119, 0.3)',
                  }
                : undefined,
              '&.Mui-disabled': {
                color: '#FFFFFF',
                opacity: 0.65,
              },
            }}
          >
            {selectedMode ? 'Let\'s Go! ✨' : 'Pick Your Learning Place!'}
          </KiddoButton>

          {/* Why link - Enhanced */}
          <Box
            component="button"
            onClick={openInfoModal}
            sx={{
              mt: 1.5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          >
          <Typography
              variant="body1"
            sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' },
              textDecoration: 'underline',
                textDecorationThickness: '2px',
                textUnderlineOffset: '3px',
                transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.dark',
                  textDecorationThickness: '3px',
                  transform: 'translateY(-1px)',
              },
            }}
          >
              Home or School? See the difference! 🤔 
          </Typography>
        </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 10,
              pt: 2,
              pb: 2,
              borderTop: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.08)',
              width: '100%',
              maxWidth:600,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                fontSize: { xs: '0.875rem', md: '0.95rem' },
                color: 'text.primary',
                opacity: 0.7,
                fontWeight: 500,
                lineHeight: 3.8,
                letterSpacing: '0.01em',
              }}
            >
              Kid-Safe Learning{' '}
              <Box component="span" sx={{ mx: 1.5, opacity: 0.4 }}>
                |
              </Box>{' '}
              Team 03 Capstone{' '}
              <Box component="span" sx={{ mx: 1.5, opacity: 0.4 }}>
                |
              </Box>{' '}
              Made with Love ❤️
            </Typography>
          </Box>
        </Box>

        {/* Info Modal */}
        {/* Info Modal */}
        <KiddoModal
          open={showInfoModal}
          onClose={closeInfoModal}
  title="Why Do We Ask This?"
  maxWidth={1000} // Increased from 600 to fit side-by-side
>
  {/* Side-by-side container for Home and School */}
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    spacing={3}
    sx={{ mb: 3 }}
        >
    {/* Home Mode Box */}
    <Box
      sx={{
        flex: 1,
        p: 3,
        background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(147, 197, 253, 0.3) 100%)',
        borderRadius: 3,
        border: '2px solid #60A5FA',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(96, 165, 250, 0.3)',
        },
      }}
    >
      <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 900, mb: 2 }}>
        🏠 At Home
            </Typography>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>✓</Box>
          Perfect for parents learning with kids
            </Typography>
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>✓</Box>
          Save favorites and track progress
            </Typography>
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>✓</Box>
          Personalized content for your child
            </Typography>
      </Stack>
          </Box>

    {/* Institution Mode Box */}
    <Box
      sx={{
        flex: 1,
        p: 3,
        background: 'linear-gradient(135deg, rgba(254, 215, 170, 0.5) 0%, rgba(251, 146, 60, 0.3) 100%)',
        borderRadius: 3,
        border: '2px solid #FB923C',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(251, 146, 60, 0.3)',
        },
      }}
    >
      <Typography variant="h6" color="secondary" gutterBottom sx={{ fontWeight: 900, mb: 2 }}>
        🏫 At School
      </Typography>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>✓</Box>
          Built for teachers and school staff
            </Typography>
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>✓</Box>
          Anonymous sessions for student privacy
            </Typography>
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box component="span" sx={{ color: 'secondary.main', fontWeight: 900 }}>✓</Box>
          Enhanced safety controls
            </Typography>
      </Stack>
    </Box>
  </Stack>

  {/* Enhanced Trust Badge */}
  <Box
    sx={{
      p: 2.5,
      background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.4) 0%, rgba(74, 222, 128, 0.3) 100%)',
      borderRadius: 2,
      textAlign: 'center',
      border: '2px solid #86EFAC',
      boxShadow: '0 4px 12px rgba(134, 239, 172, 0.2)',
    }}
  >
    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 900, fontSize: '1rem' }}>
      🔒 We keep kids safe and protect privacy!
            </Typography>
          </Box>
        </KiddoModal>
      </Box>
    </AppShellLayout>
  );
};

export default ModeSelectPage;
