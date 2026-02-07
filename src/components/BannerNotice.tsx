import React from 'react';
import { Alert, AlertProps } from '@mui/material';

interface BannerNoticeProps {
  message: string;
  severity?: AlertProps['severity'];
  icon?: React.ReactNode;
}

export const BannerNotice: React.FC<BannerNoticeProps> = ({
  message,
  severity = 'info',
  icon,
}) => {
  return (
    <Alert
      severity={severity}
      icon={icon}
      sx={{
        borderRadius: 3,
        mb: 3,
        fontWeight: 600,
        alignItems: 'center',
        '& .MuiAlert-message': {
          fontSize: '0.95rem',
        },
        '& .MuiAlert-icon': {
          fontSize: '1.6rem',
        },
      }}
    >
      {message}
    </Alert>
  );
};

export default BannerNotice;
