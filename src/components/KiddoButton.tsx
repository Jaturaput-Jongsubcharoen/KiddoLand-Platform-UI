import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface KiddoButtonProps extends ButtonProps {
  glow?: boolean;
}

export const KiddoButton: React.FC<KiddoButtonProps> = ({
  glow = false,
  sx,
  variant,
  children,
  ...props
}) => {
  const isContained = variant === 'contained';

  return (
    <Button
      {...props}
      variant={variant}
      sx={{
        borderRadius: '24px',
        padding: '10px 26px',
        fontWeight: 700,
        fontSize: '0.95rem',
        textTransform: 'none',
        transition: 'all 0.25s ease',

        // ===== TEXT COLOR =====
        color: isContained ? '#FFFFFF' : '#FFFFFF',

        // ===== OUTLINED STYLE =====
        border: !isContained ? '1.5px solid rgba(255,255,255,0.6)' : undefined,
        backgroundColor: isContained ? undefined : 'transparent',

        // ===== HOVER EFFECT =====
        '&:hover': {
          transform: 'translateY(-2px) scale(1.02)',
          backgroundColor: isContained
            ? undefined
            : 'rgba(255,255,255,0.12)',
          borderColor: 'rgba(255,255,255,0.9)',
          boxShadow: glow
            ? '0 10px 26px rgba(29, 78, 216, 0.35)'
            : '0 8px 22px rgba(0, 0, 0, 0.18)',
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
