import React from 'react';
import { Modal, Paper, Typography, IconButton, Box } from '@mui/material';
import { X } from 'lucide-react';

interface KiddoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export const KiddoModal: React.FC<KiddoModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 600,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          maxWidth,
          p: 4,
          borderRadius: 4,
          position: 'relative',
          mx: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </IconButton>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, pr: 4 }}>
          {title}
        </Typography>
        <Box>{children}</Box>
      </Paper>
    </Modal>
  );
};

export default KiddoModal;
