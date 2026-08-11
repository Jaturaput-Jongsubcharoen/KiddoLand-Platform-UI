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
    cardBg:
      'linear-gradient(165deg, rgba(196,226,255,0.34) 0%, rgba(255,255,255,0.2) 45%, rgba(175,214,255,0.16) 100%)',
    iconBg: 'linear-gradient(145deg, #60a5fa 0%, #2563eb 55%, #1d4ed8 100%)',
    iconColor: '#ffffff',
    glow: '0 10px 32px rgba(37, 99, 235, 0.22)',
    glowHover: '0 14px 38px rgba(37, 99, 235, 0.3)',
    titleColor: '#1e3a8a',
  },
  rhyme: {
    border: '#c026d3',
    cardBg:
      'linear-gradient(165deg, rgba(245,206,255,0.32) 0%, rgba(255,255,255,0.2) 45%, rgba(231,194,255,0.16) 100%)',
    iconBg: 'linear-gradient(145deg, #e879f9 0%, #c026d3 55%, #a21caf 100%)',
    iconColor: '#ffffff',
    glow: '0 10px 32px rgba(192, 38, 211, 0.22)',
    glowHover: '0 14px 38px rgba(192, 38, 211, 0.3)',
    titleColor: '#86198f',
  },
  play: {
    border: '#ea580c',
    cardBg:
      'linear-gradient(165deg, rgba(255,226,194,0.34) 0%, rgba(255,255,255,0.2) 45%, rgba(255,216,166,0.16) 100%)',
    iconBg: 'linear-gradient(145deg, #fb923c 0%, #ea580c 55%, #c2410c 100%)',
    iconColor: '#ffffff',
    glow: '0 10px 32px rgba(234, 88, 12, 0.22)',
    glowHover: '0 14px 38px rgba(234, 88, 12, 0.3)',
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
              borderColor: `${t.border}66`,
              background: t.cardBg,
              backdropFilter: 'blur(18px) saturate(150%)',
              WebkitBackdropFilter: 'blur(18px) saturate(150%)',
              boxShadow: t.glow,
              transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 2,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.06) 34%, rgba(255,255,255,0) 58%)',
                pointerEvents: 'none',
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: t.glowHover,
                borderColor: `${t.border}88`,
                background: t.cardBg,
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
