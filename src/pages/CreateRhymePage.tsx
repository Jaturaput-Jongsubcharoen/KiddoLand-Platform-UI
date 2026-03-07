import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import { generateRhyme } from '../utils/aiApi';

const quickTopics = [
  { label: 'Bedtime', prompt: 'sleepy stars and cozy blankets' },
  { label: 'Animals', prompt: 'a friendly puppy and a curious kitten' },
  { label: 'Space', prompt: 'a rocket ship visiting the moon' },
  { label: 'Dinosaurs', prompt: 'a tiny dinosaur who loves to dance' },
  { label: 'Counting', prompt: 'counting from one to ten with balloons' },
  { label: 'Friendship', prompt: 'sharing toys and helping friends' },
];

const CreateRhymePage: React.FC = () => {
  const { appState } = useApp();
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [topic, setTopic] = useState('');
  const [rhyme, setRhyme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canGenerate = useMemo(() => {
    return childName.trim().length > 0 && age >= 1 && age <= 10;
  }, [childName, age]);

  const buildPrompt = () => {
    const cleanName = childName.trim();
    const cleanTopic = topic.trim();
    const basePrompt = cleanTopic
      ? `Write a short, playful rhyme about ${cleanTopic}.`
      : 'Write a short, playful rhyme about something fun and kind.';

    return `${basePrompt} This rhyme is for ${cleanName}, age ${age}. Keep it positive and age-appropriate.`;
  };

  const handleGenerate = async () => {
    if (!appState.accessToken) {
      setErrorMessage('You are not authenticated. Please sign in again.');
      return;
    }

    if (!childName.trim()) {
      setErrorMessage('Please enter a child name to personalize the rhyme.');
      return;
    }

    if (age < 1 || age > 10) {
      setErrorMessage('Please choose an age between 1 and 10.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage('');

      const response = await generateRhyme(buildPrompt(), age, appState.accessToken);
      setRhyme(response.story);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate a rhyme.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShellLayout>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      >
        <LearningWorldScene />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={4}>
          <Box>
            <BackButton />
          </Box>

          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 1,
                    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                  }}
                >
                  Create a Rhyme
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Generate a playful, personalized rhyme in seconds.
                </Typography>
              </Box>

              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Child Name"
                    value={childName}
                    onChange={(event) => setChildName(event.target.value)}
                    helperText="Required for personalization"
                    fullWidth
                  />
                  <Box sx={{ minWidth: 220 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Age (1-10)
                    </Typography>
                    <Slider
                      value={age}
                      onChange={(_, value) => setAge(value as number)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="on"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Stack>

                <TextField
                  label="Rhyme topic (optional)"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Example: rainy day adventures with a puppy"
                  multiline
                  minRows={3}
                  fullWidth
                />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Quick ideas:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {quickTopics.map((item) => (
                      <Chip
                        key={item.label}
                        label={item.label}
                        onClick={() => setTopic(item.prompt)}
                        clickable
                        sx={{
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 1,
                          },
                          transition: 'all 0.2s ease',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <KiddoButton
                variant="contained"
                glow
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                fullWidth
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  background: !canGenerate
                    ? 'linear-gradient(135deg, #CCCCCC, #999999)'
                    : 'linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)',
                  boxShadow: !canGenerate ? 'none' : '0 6px 20px rgba(78, 205, 196, 0.4)',
                  '&:hover': {
                    background: !canGenerate
                      ? 'linear-gradient(135deg, #CCCCCC, #999999)'
                      : 'linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)',
                    boxShadow: !canGenerate ? 'none' : '0 8px 26px rgba(78, 205, 196, 0.6)',
                  },
                }}
              >
                {isGenerating ? 'Creating your rhyme...' : rhyme ? 'Generate Another Rhyme' : 'Generate Rhyme'}
              </KiddoButton>
            </Stack>
          </KiddoCard>

          {rhyme && (
            <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Your Rhyme
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                  }}
                >
                  {rhyme}
                </Typography>
              </Stack>
            </KiddoCard>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default CreateRhymePage;
