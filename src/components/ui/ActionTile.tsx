import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { KiddoCard } from '../KiddoCard';
import { IconBadge } from './IconBadge';
import { InfoTooltip } from '../InfoTooltip';

export type ActionTileTone = 'story' | 'rhyme' | 'play';

const TONE_STYLES: Record<
  ActionTileTone,
  {
    border: string;
    cardBg: string;
    iconBg: string;
    iconColor: string;
    glow: string;
    glowHover: string;
    titleColor: string;
  }
> = {
  story: {
    border: '#2563eb',
    cardBg: 'linear-gradient(168deg, #ffffff 0%, #f0f7ff 45%, #dbeafe 100%)',
    iconBg: 'linear-gradient(145deg, #60a5fa 0%, #2563eb 55%, #1d4ed8 100%)',
    iconColor: '#ffffff',
    glow: '0 10px 36px rgba(37, 99, 235, 0.28)',
    glowHover: '0 18px 48px rgba(37, 99, 235, 0.42)',
    titleColor: '#1e3a8a',
  },
  rhyme: {
    border: '#c026d3',
    cardBg: 'linear-gradient(168deg, #ffffff 0%, #fdf4ff 45%, #fae8ff 100%)',
    iconBg: 'linear-gradient(145deg, #e879f9 0%, #c026d3 55%, #a21caf 100%)',
    iconColor: '#ffffff',
    glow: '0 10px 36px rgba(192, 38, 211, 0.26)',
    glowHover: '0 18px 48px rgba(192, 38, 211, 0.4)',
    titleColor: '#86198f',
  },
  play: {
    border: '#ea580c',
    cardBg: 'linear-gradient(168deg, #ffffff 0%, #fff7ed 45%, #ffedd5 100%)',
    iconBg: 'linear-gradient(145deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)',
    iconColor: '#ffffff',
    glow: '0 10px 36px rgba(234, 88, 12, 0.3)',
    glowHover: '0 18px 48px rgba(234, 88, 12, 0.45)',
    titleColor: '#9a3412',
  },
};

interface ActionTileProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  variant?: 'horizontal' | 'vertical';
  iconBgColor?: string;
  iconColor?: string;
  hoverEffect?: boolean;
  /** Bright kid-friendly card (gradient fill, chunky border, colorful icon well). */
  tone?: ActionTileTone;
}

export const ActionTile: React.FC<ActionTileProps> = ({
  title,
  subtitle,
  icon,
  onClick,
  tooltip,
  variant = 'horizontal',
  iconBgColor = 'rgba(29, 78, 216, 0.1)',
  iconColor = 'primary.main',
  hoverEffect = true,
  tone,
}) => {
  const playful = tone != null;
  const t = tone ? TONE_STYLES[tone] : null;

  return (
    <KiddoCard
      onClick={onClick}
      hoverEffect={playful ? false : hoverEffect}
      sx={{
        p: playful ? { xs: 2.5, sm: 3 } : 3,
        overflow: 'hidden',
        position: 'relative',
        ...(playful && t
          ? {
              borderWidth: 0,
              border: '3px solid',
              borderColor: t.border,
              background: t.cardBg,
              boxShadow: t.glow,
              transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: t.glowHover,
              },
            }
          : {}),
      }}
    >
      <Stack
        direction={variant === 'horizontal' ? 'row' : 'column'}
        spacing={playful ? 2.5 : 2}
        alignItems="center"
        justifyContent={variant === 'horizontal' ? 'space-between' : 'center'}
      >
        <Stack
          direction="row"
          spacing={playful ? 2.5 : 2}
          alignItems="center"
          sx={{ flex: variant === 'horizontal' ? 1 : undefined, minWidth: 0 }}
        >
          <IconBadge
            icon={icon}
            size={playful ? 'large' : 'medium'}
            shape="rounded"
            bgcolor={playful && t ? 'transparent' : iconBgColor}
            iconColor={playful && t ? t.iconColor : iconColor}
            sx={
              playful && t
                ? {
                    background: t.iconBg,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 18px rgba(15,23,42,0.12)',
                    flexShrink: 0,
                  }
                : undefined
            }
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: playful ? 800 : 700,
                fontFamily: playful ? '"Fredoka", "Nunito", sans-serif' : undefined,
                letterSpacing: playful ? '-0.02em' : undefined,
                color: playful && t ? t.titleColor : 'text.primary',
                fontSize: playful ? { xs: '1.2rem', sm: '1.35rem' } : undefined,
                lineHeight: 1.25,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontWeight: 600,
                  color: playful ? 'text.secondary' : 'text.secondary',
                  fontSize: playful ? '0.9rem' : undefined,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {tooltip && (
          <InfoTooltip title={tooltip} placement="left" ariaLabel={`${title} info`} />
        )}
      </Stack>
    </KiddoCard>
  );
};

export default ActionTile;
