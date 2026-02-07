import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

export type IconBadgeSize = 'small' | 'medium' | 'large';
export type IconBadgeShape = 'circle' | 'rounded';

interface IconBadgeProps {
  icon: React.ReactNode;
  size?: IconBadgeSize;
  shape?: IconBadgeShape;
  bgcolor?: string;
  iconColor?: string;
  centered?: boolean;
  sx?: SxProps<Theme>;
}

const sizeMap: Record<IconBadgeSize, { container: number; icon: string }> = {
  small: { container: 46, icon: '1.25rem' },
  medium: { container: 52, icon: '1.5rem' },
  large: { container: 80, icon: '2.5rem' },
};

const shapeMap: Record<IconBadgeShape, string> = {
  circle: '50%',
  rounded: '16px',
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  size = 'medium',
  shape = 'circle',
  bgcolor = 'primary.light',
  iconColor = 'primary.main',
  centered = false,
  sx,
}) => {
  const dimensions = sizeMap[size];
  const borderRadius = shapeMap[shape];

  return (
    <Box
      sx={{
        width: dimensions.container,
        height: dimensions.container,
        borderRadius,
        bgcolor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        mx: centered ? 'auto' : undefined,
        '& > svg': {
          fontSize: dimensions.icon,
        },
        ...sx,
      }}
    >
      {icon}
    </Box>
  );
};

export default IconBadge;
