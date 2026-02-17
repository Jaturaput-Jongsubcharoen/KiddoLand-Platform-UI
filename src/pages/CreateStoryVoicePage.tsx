import React, { useState } from 'react';
import { Box, Typography, Stack, Alert, TextField } from '@mui/material';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import { generateStorySample, rewriteStory, saveFavoriteStory } from '../utils/aiApi';
import { StoryPreviewPanel } from '../components/story-creation/StoryPreviewPanel';
import { StoryEditorPanel } from '../components/story-creation/StoryEditorPanel';
import { VoiceRecorderComponent } from '../components/story-creation/VoiceRecorderComponent';

export const CreateStoryVoicePage: React.FC = () => {
  const { appState } = useApp();

  // Voice input state
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [editablePrompt, setEditablePrompt] = useState('');

  // Story state
  const [generatedStory, setGeneratedStory] = useState('');
  const [rewrittenStory, setRewrittenStory] = useState('');
  const [rewriteInstruction, setRewriteInstruction] = useState('');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [isFavoriteSaved, setIsFavoriteSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTranscriptChange = (transcript: string) => {
    setVoiceTranscript(transcript);
    setEditablePrompt(transcript);
  };

  const extractAgeFromPrompt = (value: string): number | null => {
    const patterns = [
      /\b(\d{1,2})\s*[- ]\s*year\s*[- ]\s*old\b/i,
      /\b(\d{1,2})\s*(?:years?\s*old|year\s*old|yr\s*old|y\/o)\b/i,
      /\bage\s*(\d{1,2})\b/i,
      /\bfor\s+(\d{1,2})\s*(?:years?\s*old|year\s*old)?\b/i,
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (!match) {
        continue;
      }

      const age = Number(match[1]);
      if (!Number.isNaN(age) && age >= 1 && age <= 10) {
        return age;
      }
    }

    return null;
  };

  const handleGenerate = async () => {
    const cleanedPrompt = editablePrompt.trim();
    if (!cleanedPrompt) {
      setErrorMessage('Please record or type a prompt to generate a story.');
      return;
    }

    if (!appState.accessToken) {
      setErrorMessage('You are not authenticated. Please sign in again.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage('');
      setRewrittenStory('');
      setRewriteInstruction('');
      setFavoriteMessage('');
      setIsFavoriteSaved(false);

      const response = await generateStorySample(cleanedPrompt, appState.accessToken);
      setGeneratedStory(response.output);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate story.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    const cleanedInstruction = rewriteInstruction.trim();
    if (!generatedStory) {
      setErrorMessage('Please generate a story before rewriting.');
      return;
    }

    if (!cleanedInstruction) {
      setErrorMessage('Please enter rewrite instruction.');
      return;
    }

    if (!appState.accessToken) {
      setErrorMessage('You are not authenticated. Please sign in again.');
      return;
    }

    const age = extractAgeFromPrompt(editablePrompt);
    if (age === null) {
      setErrorMessage(
        'Unable to detect age from your prompt. Please include age 1-10 in your recording or text.'
      );
      return;
    }

    try {
      setIsRewriting(true);
      setErrorMessage('');
      const response = await rewriteStory(generatedStory, cleanedInstruction, age, appState.accessToken);
      setRewrittenStory(response.story);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to rewrite story.';
      setErrorMessage(message);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSaveFavorite = async () => {
    const storyToSave = rewrittenStory || generatedStory;
    if (!storyToSave) {
      setErrorMessage('Please generate a story before saving favorite.');
      return;
    }

    if (!appState.accessToken) {
      setErrorMessage('You are not authenticated. Please sign in again.');
      return;
    }

    const age = extractAgeFromPrompt(editablePrompt);
    if (age === null) {
      setErrorMessage(
        'Unable to detect age from your prompt. Please include age 1-10 in your recording or text.'
      );
      return;
    }

    try {
      setIsSavingFavorite(true);
      setErrorMessage('');
      setFavoriteMessage('');
      const response = await saveFavoriteStory(
        editablePrompt.trim(),
        storyToSave,
        age,
        appState.accessToken
      );
      if (response.saved) {
        setIsFavoriteSaved(true);
      }
      setFavoriteMessage(response.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save favorite story.';
      setErrorMessage(message);
    } finally {
      setIsSavingFavorite(false);
    }
  };

  return (
    <AppShellLayout>
      <Stack spacing={3}>
        <Box>
          <BackButton />
        </Box>

        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              🎤 Voice Story Creator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Speak naturally to describe the story you want. Include the child's name, age (1-10), and
              what the story should be about.
            </Typography>
          </Stack>
        </KiddoCard>

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Voice Recorder */}
        <VoiceRecorderComponent
          onTranscriptChange={handleTranscriptChange}
          disabled={isGenerating}
        />

        {/* Editable Prompt */}
        {editablePrompt && (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Edit Your Prompt (Optional)</Typography>
              <TextField
                multiline
                minRows={4}
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                placeholder="You can edit the transcript here before generating..."
                fullWidth
              />
              <KiddoButton
                variant="contained"
                glow
                onClick={handleGenerate}
                disabled={isGenerating}
                fullWidth
              >
                {isGenerating ? 'Generating Story...' : 'Generate Story'}
              </KiddoButton>
            </Stack>
          </KiddoCard>
        )}

        {/* Generated Story */}
        {generatedStory && (
          <>
            <StoryPreviewPanel story={generatedStory} isLoading={isGenerating} />

            <StoryEditorPanel
              rewriteInstruction={rewriteInstruction}
              onRewriteInstructionChange={setRewriteInstruction}
              onRewrite={handleRewrite}
              onSaveFavorite={handleSaveFavorite}
              isRewriting={isRewriting}
              isSavingFavorite={isSavingFavorite}
              isFavoriteSaved={isFavoriteSaved}
              favoriteMessage={favoriteMessage}
            />

            {rewrittenStory && (
              <StoryPreviewPanel story={rewrittenStory} title="Rewritten Story" />
            )}
          </>
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default CreateStoryVoicePage;
