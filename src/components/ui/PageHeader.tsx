import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  icon?: React.ReactNode;
  mb?: number;
  sx?: SxProps<Theme>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  align = 'center',
  icon,
  mb = 3,
  sx,
}) => {
  return (
    <Box sx={{ mb, textAlign: align, ...sx }}>
      {icon && (
        <Box sx={{ display: 'flex', justifyContent: align, mb: 1 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
