import { SxProps, Theme } from '@mui/material';

/**
 * Gradient text utility for creating gradient text effects
 */
export const createGradientText = (
  color1: string = '#1D4ED8',
  color2: string = '#14B8A6',
  angle: number = 135
): SxProps<Theme> => ({
  background: `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

/**
 * Predefined gradient text styles
 */
export const gradientText = {
  primary: createGradientText('#1D4ED8', '#14B8A6'),
  secondary: createGradientText('#F97316', '#FCD34D'),
  warm: createGradientText('#FF6B35', '#4ECDC4'),
};

/**
 * Standard shadow scale
 */
export const shadows = {
  xs: '0 2px 8px rgba(15, 23, 42, 0.04)',
  sm: '0 4px 12px rgba(15, 23, 42, 0.06)',
  md: '0 6px 18px rgba(15, 23, 42, 0.08)',
  lg: '0 12px 32px rgba(15, 23, 42, 0.12)',
  xl: '0 16px 40px rgba(15, 23, 42, 0.16)',
  '2xl': '0 24px 48px rgba(15, 23, 42, 0.20)',
};

/**
 * Common background gradients
 */
export const backgroundGradients = {
  primary: 'linear-gradient(120deg, #1D4ED8 0%, #14B8A6 100%)',
  secondary: 'linear-gradient(120deg, #F97316 0%, #FCD34D 100%)',
  warm: 'linear-gradient(135deg, #FF6B35 0%, #4ECDC4 100%)',
  page: 'linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 100%)',
};

/**
 * Icon background colors with consistent opacity
 */
export const iconBackgrounds = {
  primary: 'rgba(29, 78, 216, 0.1)',
  secondary: 'rgba(249, 115, 22, 0.12)',
  info: 'rgba(20, 184, 166, 0.12)',
  success: 'rgba(22, 163, 74, 0.12)',
  warning: 'rgba(245, 158, 11, 0.12)',
  error: 'rgba(239, 68, 68, 0.12)',
};

/**
 * Hover transform utilities
 */
export const hoverTransforms = {
  lift: {
    transform: 'translateY(-4px)',
    transition: 'all 0.25s ease',
  },
  liftSmall: {
    transform: 'translateY(-2px)',
    transition: 'all 0.25s ease',
  },
  scale: {
    transform: 'scale(1.02)',
    transition: 'all 0.25s ease',
  },
  scaleSmall: {
    transform: 'scale(1.01)',
    transition: 'all 0.25s ease',
  },
};
