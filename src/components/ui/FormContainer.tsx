import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface FormContainerProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  gap?: number;
  sx?: SxProps<Theme>;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  onSubmit,
  children,
  gap = 2.5,
  sx,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          ...sx,
        }}
      >
        {children}
      </Box>
    </form>
  );
};

export default FormContainer;
