import React from 'react';
import { KiddoButton } from '.';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <KiddoButton
      variant="outlined"
      onClick={() => navigate(-1)}
      startIcon={<ArrowLeft size={18} />}
    >
      Back
    </KiddoButton>
  );
};

export default BackButton;
