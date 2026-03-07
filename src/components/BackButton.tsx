import React from 'react';
import { KiddoButton } from '.';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: number | string;
}

const BackButton: React.FC<BackButtonProps> = ({ to = -1 }) => {
  const navigate = useNavigate();
  return (
    <KiddoButton
      variant="outlined"
      onClick={() => navigate(to)}
      startIcon={<ArrowLeft size={18} />}
      sx={{
        color: '#2563eb',
        border: '1.5px solid #2563eb',
        '&:hover': {
          backgroundColor: 'rgba(37,99,235,0.08)',
          borderColor: '#2563eb',
        },
      }}
    >
      Back
    </KiddoButton>
  );
};

export default BackButton;
