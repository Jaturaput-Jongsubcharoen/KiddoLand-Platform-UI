import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface KiddoButtonProps extends ButtonProps {
  glow?: boolean;
}

export const KiddoButton: React.FC<KiddoButtonProps> = ({
  glow = false,
  sx,
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      sx={{
        borderRadius: '24px',
        padding: '12px 32px',
        fontWeight: 700,
        fontSize: '1rem',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: glow
            ? '0 10px 26px rgba(29, 78, 216, 0.35)'
            : '0 10px 26px rgba(15, 23, 42, 0.16)',
        },
        '&:active': {
          transform: 'translateY(0) scale(0.98)',
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

export default KiddoButton;
