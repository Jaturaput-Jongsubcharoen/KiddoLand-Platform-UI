import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { KiddoCard } from '../KiddoCard';
import { IconBadge } from './IconBadge';
import { InfoTooltip } from '../InfoTooltip';

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
}) => {
  return (
    <KiddoCard onClick={onClick} hoverEffect={hoverEffect} sx={{ p: 3 }}>
      <Stack
        direction={variant === 'horizontal' ? 'row' : 'column'}
        spacing={2}
        alignItems="center"
        justifyContent={variant === 'horizontal' ? 'space-between' : 'center'}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flex: variant === 'horizontal' ? 1 : undefined }}
        >
          <IconBadge
            icon={icon}
            size="medium"
            shape="rounded"
            bgcolor={iconBgColor}
            iconColor={iconColor}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
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
