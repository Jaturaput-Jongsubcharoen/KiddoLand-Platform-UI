import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormInput, MessageSquare, Mic, Image } from 'lucide-react';

const STORY_MODES = [
  {
    value: '/home/create-story-form',
    label: 'Form Builder',
    icon: <FormInput size={18} />,
    description: 'Guided form inputs',
  },
  {
    value: '/home/create-story',
    label: 'Chat Creator',
    icon: <MessageSquare size={18} />,
    description: 'Free-form text prompt',
  },
  {
    value: '/home/create-story-voice',
    label: 'Voice Story',
    icon: <Mic size={18} />,
    description: 'Speak your idea',
  },
  {
    value: '/home/create-story-image',
    label: 'Picture Story',
    icon: <Image size={18} />,
    description: 'Upload an image',
  },
] as const;

export const ModeSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentMode = STORY_MODES.find((mode) => mode.value === location.pathname) || STORY_MODES[0];

  const handleModeChange = (newPath: string) => {
    navigate(newPath);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="mode-switcher-label">Story Creation Mode</InputLabel>
      <Select
        labelId="mode-switcher-label"
        value={currentMode.value}
        label="Story Creation Mode"
        onChange={(e) => handleModeChange(e.target.value)}
        sx={{
          backgroundColor: 'background.paper',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
        }}
      >
        {STORY_MODES.map((mode) => (
          <MenuItem key={mode.value} value={mode.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              <ListItemIcon sx={{ minWidth: 'auto', color: 'primary.main' }}>
                {mode.icon}
              </ListItemIcon>
              <ListItemText
                primary={mode.label}
                secondary={mode.description}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
