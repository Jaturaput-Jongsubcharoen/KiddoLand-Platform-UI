import React, { useState } from 'react';
import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import { useApp } from '../context/AppContext';
import { generateStorySample, rewriteStory, saveFavoriteStory } from '../utils/aiApi';
import { SharedNavBar } from '../components/SharedNavBar';
import BackButton from '../components/BackButton';

export const CreateStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { appState } = useApp();

  const [prompt, setPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [rewrittenStory, setRewrittenStory] = useState('');
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [isFavoriteSaved, setIsFavoriteSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt) {
      setErrorMessage('Please enter a prompt to generate a story.');
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

    const age = extractAgeFromPrompt(prompt);
    if (age === null) {
      setErrorMessage('Unable to detect age from prompt. Please include age 1-10 in your prompt.');
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
    if (!generatedStory) {
      setErrorMessage('Please generate a story before saving favorite.');
      return;
    }

    if (!appState.accessToken) {
      setErrorMessage('You are not authenticated. Please sign in again.');
      return;
    }

    const age = extractAgeFromPrompt(prompt);
    if (age === null) {
      setErrorMessage('Unable to detect age from prompt. Please include age 1-10 in your prompt.');
      return;
    }

    try {
      setIsSavingFavorite(true);
      setErrorMessage('');
      setFavoriteMessage('');
      const response = await saveFavoriteStory(prompt.trim(), generatedStory, age, appState.accessToken);
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
        <KiddoCard hoverEffect={false} sx={{ p: 2.5 }}>
          <SharedNavBar />
        </KiddoCard>
        <Box>
          <BackButton />
        </Box>

        <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Typography variant="h4">Create a Story</Typography>
            <Typography variant="body2" color="text.secondary">
              Chatbot-style sample generation. Include child name and age (1-10), for example: "Tell a
              bedtime story for Emma, age 7, about space adventure."
            </Typography>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              label="Type your story prompt"
              multiline
              minRows={4}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Tell a story for Emma, age 7, about a brave turtle in space."
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <KiddoButton
                variant="contained"
                glow
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Story'}
              </KiddoButton>
            </Stack>
          </Stack>
        </KiddoCard>

        {generatedStory && (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Generated Story</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {generatedStory}
              </Typography>

              <TextField
                label="Rewrite instruction"
                multiline
                minRows={2}
                value={rewriteInstruction}
                onChange={(event) => setRewriteInstruction(event.target.value)}
                placeholder="Make the story funnier and add a happy ending for Emma."
                fullWidth
              />

              {favoriteMessage && <Alert severity={isFavoriteSaved ? 'success' : 'warning'}>{favoriteMessage}</Alert>}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <KiddoButton
                  variant="contained"
                  onClick={handleRewrite}
                  disabled={isRewriting}
                >
                  {isRewriting ? 'Rewriting...' : 'Rewrite Story'}
                </KiddoButton>
                <KiddoButton
                  variant="outlined"
                  onClick={handleSaveFavorite}
                  disabled={isSavingFavorite || isFavoriteSaved}
                >
                  {isFavoriteSaved ? 'Saved Favorite' : isSavingFavorite ? 'Saving...' : 'Save Favorite'}
                </KiddoButton>
              </Stack>

              {rewrittenStory && (
                <>
                  <Typography variant="h5">Rewritten Story</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {rewrittenStory}
                  </Typography>
                </>
              )}
            </Stack>
          </KiddoCard>
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default CreateStoryPage;
