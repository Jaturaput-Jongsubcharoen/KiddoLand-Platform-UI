import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import { useChildProfile } from '../context/ChildProfileContext';
import { generateStorySample, rewriteStory, saveFavoriteStory } from '../utils/aiApi';
import { StoryPreviewPanel } from '../components/story-creation/StoryPreviewPanel';
import { StoryEditorPanel } from '../components/story-creation/StoryEditorPanel';
import { INTEREST_OPTIONS, AGE_BANDS } from '../types/childProfile';

const STORY_TYPES = [
  'Bedtime Story',
  'Adventure Story',
  'Educational Story',
  'Moral Story',
  'Fantasy Story',
  'Mystery Story',
] as const;

const LEARNING_GOALS = [
  'Counting & Numbers',
  'Colors & Shapes',
  'Emotions & Feelings',
  'Friendship & Sharing',
  'Problem Solving',
  'Nature & Science',
  'Confidence Building',
  'Creativity',
] as const;

export const CreateStoryFormPage: React.FC = () => {
  const { appState } = useApp();
  const { selectedProfile } = useChildProfile();

  // Form state
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [storyType, setStoryType] = useState('');
  const [learningGoal, setLearningGoal] = useState('');

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

  // Auto-fill from profile
  useEffect(() => {
    if (selectedProfile) {
      setChildName(selectedProfile.name);
      setAge(selectedProfile.age);
      setInterests(selectedProfile.interests);
    }
  }, [selectedProfile]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const buildPrompt = () => {
    let prompt = `Create a ${storyType || 'story'}`;
    
    if (childName) {
      prompt += ` for ${childName}`;
    }
    
    if (age) {
      prompt += `, age ${age}`;
    }

    if (interests.length > 0) {
      prompt += `. The child loves ${interests.join(', ')}`;
    }

    if (learningGoal) {
      prompt += `. Focus on teaching about ${learningGoal}`;
    }

    prompt += '. Make it engaging, age-appropriate, and fun!';

    return prompt;
  };

  const handleGenerate = async () => {
    // Validation
    if (!age || age < 1 || age > 10) {
      setErrorMessage('Please select an age between 1 and 10.');
      return;
    }

    if (interests.length === 0) {
      setErrorMessage('Please select at least one interest.');
      return;
    }

    if (!storyType) {
      setErrorMessage('Please select a story type.');
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

      const prompt = buildPrompt();
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

    if (!age || age < 1 || age > 10) {
      setErrorMessage('Invalid age. Please select an age between 1 and 10.');
      return;
    }

    try {
      setIsRewriting(true);
      setErrorMessage('');
      const response = await rewriteStory(
        generatedStory,
        cleanedInstruction,
        age as number,
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

    if (!age || age < 1 || age > 10) {
      setErrorMessage('Invalid age. Please select an age between 1 and 10.');
      return;
    }

    try {
      setIsSavingFavorite(true);
      setErrorMessage('');
      setFavoriteMessage('');
      const prompt = buildPrompt();
      const response = await saveFavoriteStory(prompt, storyToSave, age as number, appState.accessToken);
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
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                📝 Story Form Builder
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the form below to create a personalized story
              </Typography>
            </Box>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {/* Child Name */}
            <TextField
              label="Child's Name (Optional)"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g., Emma"
              fullWidth
            />

            {/* Age */}
            <FormControl fullWidth required>
              <InputLabel id="age-select-label">Age Band</InputLabel>
              <Select
                labelId="age-select-label"
                value={age}
                label="Age Band"
                onChange={(e) => setAge(e.target.value as number)}
              >
                {AGE_BANDS.map((band) => (
                  <MenuItem key={band.value} value={band.value}>
                    {band.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Interests */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Interests (select at least one) *
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {INTEREST_OPTIONS.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onClick={() => toggleInterest(interest)}
                    color={interests.includes(interest) ? 'primary' : 'default'}
                    variant={interests.includes(interest) ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Story Type */}
            <FormControl fullWidth required>
              <InputLabel id="story-type-label">Story Type</InputLabel>
              <Select
                labelId="story-type-label"
                value={storyType}
                label="Story Type"
                onChange={(e) => setStoryType(e.target.value)}
              >
                {STORY_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Learning Goal */}
            <FormControl fullWidth>
              <InputLabel id="learning-goal-label">Learning Goal (Optional)</InputLabel>
              <Select
                labelId="learning-goal-label"
                value={learningGoal}
                label="Learning Goal (Optional)"
                onChange={(e) => setLearningGoal(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {LEARNING_GOALS.map((goal) => (
                  <MenuItem key={goal} value={goal}>
                    {goal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

export default CreateStoryFormPage;
