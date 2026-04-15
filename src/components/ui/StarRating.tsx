import React from 'react';
import { Box, Stack } from '@mui/material';
import { Star } from 'lucide-react';

interface StarRatingProps {
  /** How many stars to award (0 – totalStars). */
  filledStars: number;
  /** Total stars in the row (default 3). */
  totalStars?: number;
  /** Icon size in px (default 56). */
  size?: number;
  /** Animate stars popping in sequentially (default true). */
  animate?: boolean;
  /** Pulse filled stars continuously — used for perfect score (default false). */
  pulse?: boolean;
}

const GOLD = '#F7C948';
const GOLD_DARK = '#E0A800';
const GOLD_GLOW = 'rgba(247, 201, 72, 0.7)';
const EMPTY_COLOR = '#CBD5E1';

/**
 * Renders a row of stars that fill with gold based on filledStars / totalStars.
 * Each star pops in with a staggered spring animation.
 * Filled stars glow gold; when pulse=true they gently bounce (perfect score effect).
 */
const StarRating: React.FC<StarRatingProps> = ({
  filledStars,
  totalStars = 3,
  size = 56,
  animate = true,
  pulse = false,
}) => {
  const filled = Math.min(Math.max(Math.round(filledStars), 0), totalStars);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
      {Array.from({ length: totalStars }).map((_, i) => {
        const isFilled = i < filled;

        return (
          <Box
            key={i}
            sx={{
              display: 'inline-flex',
              position: 'relative',
              /* pop-in on mount */
              ...(animate && {
                opacity: 0,
                transform: 'scale(0.2) rotate(-20deg)',
                animation: 'starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                animationDelay: `${i * 0.2}s`,
              }),
              /* continuous pulse for filled stars when pulse=true */
              ...(pulse && isFilled && {
                animation: [
                  animate
                    ? `starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${i * 0.2}s`
                    : '',
                  `starPulse 1.6s ease-in-out ${0.6 + i * 0.2}s infinite`,
                ]
                  .filter(Boolean)
                  .join(', '),
              }),
              /* glow filter for filled stars */
              filter: isFilled
                ? `drop-shadow(0 0 6px ${GOLD_GLOW}) drop-shadow(0 0 14px ${GOLD_GLOW})`
                : 'none',
              '@keyframes starPop': {
                '0%': { opacity: 0, transform: 'scale(0.2) rotate(-20deg)' },
                '65%': { opacity: 1, transform: 'scale(1.2) rotate(6deg)' },
                '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
              },
              '@keyframes starPulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.12)' },
              },
            }}
          >
            <Star
              size={size}
              fill={isFilled ? GOLD : 'none'}
              color={isFilled ? GOLD_DARK : EMPTY_COLOR}
              strokeWidth={isFilled ? 1.2 : 2}
            />
          </Box>
        );
      })}
    </Stack>
  );
};

export default StarRating;
