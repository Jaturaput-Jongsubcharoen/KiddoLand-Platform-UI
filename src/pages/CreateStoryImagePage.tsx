import React, { useState } from 'react';
import { Box, Typography, Stack, Alert, TextField } from '@mui/material';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import { generateStorySample, rewriteStory, saveFavoriteStory } from '../utils/aiApi';
import { StoryPreviewPanel } from '../components/story-creation/StoryPreviewPanel';
import { StoryEditorPanel } from '../components/story-creation/StoryEditorPanel';
import { ImageUploader } from '../components/story-creation/ImageUploader';

export const CreateStoryImagePage: React.FC = () => {
  const { appState } = useApp();

  // Image state
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    base64: string;
    preview: string;
  } | null>(null);
  const [imageDescription, setImageDescription] = useState('');

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

  const handleImageSelect = (imageData: { file: File; base64: string; preview: string }) => {
    setSelectedImage(imageData);
    setErrorMessage('');
  };

  const extractAgeFromDescription = (value: string): number | null => {
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

  const buildPromptFromImage = (): string => {
    let prompt = 'Create a story inspired by this image.';

    if (imageDescription.trim()) {
      prompt += ` ${imageDescription.trim()}`;
    } else {
      prompt += ' The image shows a drawing or photo that should inspire an engaging, creative story for a child.';
    }

    prompt += ' Make it fun, imaginative, and age-appropriate.';

    return prompt;
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      setErrorMessage('Please upload an image first.');
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

      const prompt = buildPromptFromImage();
      
      // Note: This uses the text-based story generation API
      // In a production app, you would integrate with a vision API (GPT-4 Vision, Claude Vision, etc.)
      // to analyze the image and generate a more contextual story
      const response = await generateStorySample(prompt, appState.accessToken);
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

    // Try to extract age from description, default to 7 if not found
    const age = extractAgeFromDescription(imageDescription) || 7;

    try {
      setIsRewriting(true);
      setErrorMessage('');
      const response = await rewriteStory(
        generatedStory,
        cleanedInstruction,
        age,
        appState.accessToken
      );
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

    // Try to extract age from description, default to 7 if not found
    const age = extractAgeFromDescription(imageDescription) || 7;

    try {
      setIsSavingFavorite(true);
      setErrorMessage('');
      setFavoriteMessage('');
      const prompt = buildPromptFromImage();
      const response = await saveFavoriteStory(prompt, storyToSave, age, appState.accessToken);
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
              🖼️ Picture Story Creator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a drawing, photo, or any image to inspire a personalized story. Add optional
              details about what you'd like the story to include.
            </Typography>
          </Stack>
        </KiddoCard>

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Image Uploader */}
        <ImageUploader onImageSelect={handleImageSelect} disabled={isGenerating} />

        {/* Optional Description */}
        {selectedImage && (
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Tell us more (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add details like the child's name, age, or what the story should be about
                </Typography>
              </Box>

              <TextField
                multiline
                minRows={4}
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="e.g., Create a bedtime story for Emma, age 7, about the adventure in this picture..."
                fullWidth
              />

              <KiddoButton
                variant="contained"
                glow
                onClick={handleGenerate}
                disabled={isGenerating}
                fullWidth
              >
                {isGenerating ? 'Generating Story...' : 'Generate Story from Image'}
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

        {/* Technical Note */}
        {selectedImage && (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> This feature currently generates stories based on your text
              description. Full AI vision analysis (to automatically understand what's in the image)
              will be available in a future update.
            </Typography>
          </Alert>
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default CreateStoryImagePage;
