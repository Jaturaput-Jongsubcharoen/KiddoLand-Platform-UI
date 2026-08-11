import React, { ReactNode } from 'react';
import { Card, CardProps } from '@mui/material';

interface KiddoCardProps extends CardProps {
  children: ReactNode;
  hoverEffect?: boolean;
  selected?: boolean;
  interactive?: boolean;
}

export const KiddoCard: React.FC<KiddoCardProps> = ({
  children,
  hoverEffect = true,
  selected = false,
  interactive,
  onClick,
  sx,
  ...props
}) => {
  const isInteractive = interactive ?? Boolean(onClick);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <Card
      {...props}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      sx={{
        cursor: isInteractive ? 'pointer' : 'default',
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'rgba(255,255,255,0.5)',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.18) 100%)',
        backdropFilter: 'blur(20px) saturate(155%)',
        WebkitBackdropFilter: 'blur(20px) saturate(155%)',
        boxShadow: selected
          ? '0 16px 42px rgba(15, 23, 42, 0.18)'
          : '0 10px 30px rgba(15, 23, 42, 0.14)',
        transition: 'all 0.25s ease',
        '&:hover': hoverEffect
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.2)',
              borderColor: 'rgba(255,255,255,0.68)',
              background:
                'linear-gradient(160deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.22) 100%)',
            }
          : undefined,
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

export default KiddoCard;
