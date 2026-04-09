import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Sparkles } from 'lucide-react';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import {
  generateLearningActivity,
  type LearningActivityData,
  type LearningActivityQuestion,
} from '../utils/aiApi';

const AGE_BAND_PRESETS = ['3-5', '5-7', '8-10', '11-12'] as const;

type DifficultyChoice = '' | 'easy' | 'medium' | 'hard';

type Phase = 'form' | 'quiz' | 'complete';

const PlayLearningActivityPage: React.FC = () => {
  const { appState } = useApp();
  const mode = appState.selectedMode ?? 'home';
  const backTarget = mode === 'institution' ? '/institution' : '/home';

  const [ageBand, setAgeBand] = useState('5-7');
  const [theme, setTheme] = useState('Animals');
  const [learningGoal, setLearningGoal] = useState('Vocabulary');
  const [difficulty, setDifficulty] = useState<DifficultyChoice>('medium');

  const [phase, setPhase] = useState<Phase>('form');
  const [activity, setActivity] = useState<LearningActivityData | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentQuestion: LearningActivityQuestion | null = useMemo(() => {
    if (!activity?.questions?.length) return null;
    return activity.questions[questionIndex] ?? null;
  }, [activity, questionIndex]);

  const resetQuizState = () => {
    setActivity(null);
    setPhase('form');
    setQuestionIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setErrorMessage('');
  };

  const handleGenerate = async () => {
    if (!appState.accessToken) {
      setErrorMessage('You are not signed in. Please sign in again.');
      return;
    }
    const trimmedTheme = theme.trim();
    const trimmedGoal = learningGoal.trim();
    const trimmedAge = ageBand.trim();

    const missing: string[] = [];
    if (!trimmedAge) missing.push('age band');
    if (!trimmedTheme) missing.push('theme');
    if (!trimmedGoal) missing.push('learning goal');
    if (missing.length > 0) {
      setErrorMessage(
        `Please fill in: ${missing.join(', ')}.`,
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const result = await generateLearningActivity(
        {
          age_band: trimmedAge,
          theme: trimmedTheme,
          learning_goal: trimmedGoal,
          ...(difficulty ? { difficulty } : {}),
        },
        appState.accessToken,
      );

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to generate activity.');
        return;
      }

      setActivity(result.data);
      setQuestionIndex(0);
      setSelectedOption(null);
      setCorrectCount(0);
      setPhase('quiz');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickOption = (index: number) => {
    if (!currentQuestion || selectedOption !== null) return;
    setSelectedOption(index);
    if (index === currentQuestion.correct_index) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (!activity) return;
    if (questionIndex < activity.questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setPhase('complete');
    }
  };

  const isCorrect =
    selectedOption !== null && currentQuestion
      ? selectedOption === currentQuestion.correct_index
      : null;

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
            <BackButton to={backTarget} />
          </Box>

          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Sparkles size={28} color="#F7931E" />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Play a Learning Activity
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Generate a short kid-friendly quiz from your class or home session. Questions and
              answer order are shuffled fresh each time you play.
            </Typography>

            {phase === 'form' && (
              <Stack spacing={2.5}>
                {errorMessage && (
                  <Alert severity="error" onClose={() => setErrorMessage('')}>
                    {errorMessage}
                  </Alert>
                )}

                <Box>
                  <TextField
                    label="Age band"
                    placeholder="e.g. 5-7"
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value)}
                    fullWidth
                    required
                    helperText="Who this quiz is for (shown to the AI). Use presets below or type your own."
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {AGE_BAND_PRESETS.map((band) => (
                      <Chip
                        key={band}
                        label={band}
                        onClick={() => setAgeBand(band)}
                        color={ageBand === band ? 'primary' : 'default'}
                        variant={ageBand === band ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Stack>
                </Box>

                <TextField
                  label="Theme"
                  placeholder="e.g. Animals, Space, Friendship"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  fullWidth
                  required
                  helperText="Required — the main topic for the quiz."
                />

                <TextField
                  label="Learning goal"
                  placeholder="e.g. Vocabulary, Counting, Science facts"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  fullWidth
                />

                <FormControl fullWidth sx={{ maxWidth: 320 }}>
                  <InputLabel id="difficulty-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-label"
                    label="Difficulty"
                    value={difficulty || 'medium'}
                    onChange={(e) =>
                      setDifficulty((e.target.value || 'medium') as DifficultyChoice)
                    }
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>

                {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

                <KiddoButton
                  variant="contained"
                  color="secondary"
                  glow
                  onClick={handleGenerate}
                  disabled={loading}
                  sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, py: 1.5, px: 3 }}
                >
                  {loading ? 'Creating your quiz…' : 'Generate quiz'}
                </KiddoButton>
              </Stack>
            )}

            {phase === 'quiz' && activity && currentQuestion && (
              <Stack spacing={2.5}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {activity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Question {questionIndex + 1} of {activity.questions.length}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
                  {currentQuestion.prompt}
                </Typography>

                <Stack spacing={1.5}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const showCorrect = selectedOption !== null && idx === currentQuestion.correct_index;
                    const showWrong = isSelected && idx !== currentQuestion.correct_index;
                    return (
                      <KiddoButton
                        key={`${questionIndex}-${idx}`}
                        variant={showCorrect ? 'contained' : 'outlined'}
                        onClick={() => handlePickOption(idx)}
                        disabled={selectedOption !== null}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          py: 1.5,
                          borderColor: showWrong ? 'error.main' : undefined,
                          color: showWrong ? 'error.main' : undefined,
                          ...(showCorrect && {
                            bgcolor: 'success.main',
                            borderColor: 'success.main',
                          }),
                        }}
                      >
                        {opt}
                      </KiddoButton>
                    );
                  })}
                </Stack>

                {selectedOption !== null && (
                  <Alert severity={isCorrect ? 'success' : 'info'} sx={{ mt: 1 }}>
                    {isCorrect
                      ? currentQuestion.feedback_correct
                      : currentQuestion.feedback_incorrect}
                  </Alert>
                )}

                {selectedOption !== null && (
                  <KiddoButton variant="contained" onClick={handleNext} sx={{ alignSelf: 'flex-start' }}>
                    {questionIndex < activity.questions.length - 1 ? 'Next question' : 'See results'}
                  </KiddoButton>
                )}
              </Stack>
            )}

            {phase === 'complete' && activity && (
              <Stack spacing={2} alignItems="flex-start">
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Great job!
                </Typography>
                <Typography variant="body1">
                  You got <strong>{correctCount}</strong> out of{' '}
                  <strong>{activity.questions.length}</strong> correct in{' '}
                  <strong>{activity.title}</strong>.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <KiddoButton
                    variant="contained"
                    color="secondary"
                    glow
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    New quiz (same settings)
                  </KiddoButton>
                  <KiddoButton variant="outlined" onClick={resetQuizState}>
                    Change topic
                  </KiddoButton>
                </Stack>
                {loading && <LinearProgress sx={{ width: '100%', borderRadius: 1 }} />}
                {errorMessage && (
                  <Alert severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                  </Alert>
                )}
              </Stack>
            )}
          </KiddoCard>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default PlayLearningActivityPage;
