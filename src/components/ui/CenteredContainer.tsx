import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface CenteredContainerProps {
  children: React.ReactNode;
  minHeight?: string;
  maxWidth?: number | string;
  sx?: SxProps<Theme>;
}

export const CenteredContainer: React.FC<CenteredContainerProps> = ({
  children,
  minHeight = 'calc(100vh - 200px)',
  maxWidth,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        maxWidth,
        mx: maxWidth ? 'auto' : undefined,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default CenteredContainer;
