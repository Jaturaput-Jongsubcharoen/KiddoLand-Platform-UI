import React from 'react';
import { Tooltip, TooltipProps, IconButton } from '@mui/material';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title: React.ReactNode;
  placement?: TooltipProps['placement'];
  iconSize?: 'small' | 'medium' | 'large';
  ariaLabel?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  placement = 'top',
  iconSize = 'small',
  ariaLabel = 'More info',
}) => {
  return (
    <Tooltip title={title} placement={placement} arrow enterDelay={200} leaveDelay={100}>
      <IconButton
        size={iconSize}
        aria-label={ariaLabel}
        sx={{
          ml: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        <Info size={iconSize === 'small' ? 16 : iconSize === 'large' ? 24 : 20} />
      </IconButton>
    </Tooltip>
  );
};

export default InfoTooltip;
