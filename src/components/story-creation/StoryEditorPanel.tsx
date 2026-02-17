import React from 'react';
import { Box, TextField, Stack, Alert } from '@mui/material';
import { KiddoButton } from '../KiddoButton';
import { KiddoCard } from '../KiddoCard';

interface StoryEditorPanelProps {
  rewriteInstruction: string;
  onRewriteInstructionChange: (value: string) => void;
  onRewrite: () => void;
  onSaveFavorite: () => void;
  isRewriting: boolean;
  isSavingFavorite: boolean;
  isFavoriteSaved: boolean;
  favoriteMessage: string;
  disabled?: boolean;
}

export const StoryEditorPanel: React.FC<StoryEditorPanelProps> = ({
  rewriteInstruction,
  onRewriteInstructionChange,
  onRewrite,
  onSaveFavorite,
  isRewriting,
  isSavingFavorite,
  isFavoriteSaved,
  favoriteMessage,
  disabled = false,
}) => {
  return (
    <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
      <Stack spacing={2.5}>
        <TextField
          label="Rewrite instruction"
          multiline
          minRows={3}
          value={rewriteInstruction}
          onChange={(e) => onRewriteInstructionChange(e.target.value)}
          placeholder="Make the story funnier, add more details, or change the ending..."
          fullWidth
          disabled={disabled}
        />

        {favoriteMessage && (
          <Alert severity={isFavoriteSaved ? 'success' : 'warning'}>
            {favoriteMessage}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <KiddoButton
            variant="contained"
            onClick={onRewrite}
            disabled={isRewriting || disabled}
            sx={{ flex: 1 }}
          >
            {isRewriting ? 'Rewriting...' : 'Rewrite Story'}
          </KiddoButton>
          <KiddoButton
            variant="outlined"
            onClick={onSaveFavorite}
            disabled={isSavingFavorite || isFavoriteSaved || disabled}
            sx={{ flex: 1 }}
          >
            {isFavoriteSaved
              ? 'Saved Favorite'
              : isSavingFavorite
                ? 'Saving...'
                : 'Save Favorite'}
          </KiddoButton>
        </Stack>
      </Stack>
    </KiddoCard>
  );
};
