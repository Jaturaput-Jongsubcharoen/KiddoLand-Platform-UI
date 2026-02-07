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
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? '0 14px 36px rgba(15, 23, 42, 0.14)' : undefined,
        transition: 'all 0.25s ease',
        '&:hover': hoverEffect
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
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
