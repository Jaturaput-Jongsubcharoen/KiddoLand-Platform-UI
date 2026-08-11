import React, { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import { AppShellLayout, KiddoButton, KiddoCard } from '../components';
import { LearningWorldScene } from '../components/LearningWorldScene';
import BackButton from '../components/BackButton';
import StarRating from '../components/ui/StarRating';
import CelebrationEffect from '../components/ui/CelebrationEffect';
import { useApp } from '../context/AppContext';
import {
  generateLearningActivity,
  type LearningActivityData,
  type LearningActivityQuestion,
} from '../utils/aiApi';
import { AGE_BANDS, INTERESTS, LEARNING_GOALS } from '../types/storyOptions';

/** Same themes as story “interests” plus a few quiz-friendly extras; user can type any theme (freeSolo). */
const QUIZ_THEME_SUGGESTIONS: string[] = Array.from(
  new Set<string>([
    ...INTERESTS,
    'Weather',
    'Shapes and colors',
    'Community helpers',
  ]),
);

/** Story prefs goals plus common quiz angles; user can still type anything (freeSolo). */
const QUIZ_LEARNING_GOAL_SUGGESTIONS: string[] = Array.from(
  new Set<string>([
    'Vocabulary',
    'Counting',
    'Science facts',
    'Reading comprehension',
    'Geography',
    ...LEARNING_GOALS,
  ]),
);

/** Numeric story age-band value → short range string for the activity API (e.g. "5-6"). */
const AGE_BAND_TO_API_STRING: Record<number, string> = {
  1: '1-2',
  3: '3-4',
  5: '5-6',
  7: '7-8',
  9: '9-10',
  11: '11-12',
};

type DifficultyChoice = '' | 'easy' | 'medium' | 'hard';

type Phase = 'form' | 'quiz' | 'complete';

/** Pastel “lanes” so each choice looks distinct before an answer is picked. */
const KID_OPTION_PALETTES = [
  {
    border: '#3b82f6',
    badgeBg: '#ffffff',
    badgeColor: '#1d4ed8',
    gradient: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 55%, #bfdbfe 100%)',
  },
  {
    border: '#a855f7',
    badgeBg: '#ffffff',
    badgeColor: '#6d28d9',
    gradient: 'linear-gradient(145deg, #faf5ff 0%, #f3e8ff 55%, #e9d5ff 100%)',
  },
  {
    border: '#f59e0b',
    badgeBg: '#ffffff',
    badgeColor: '#c2410c',
    gradient: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%)',
  },
] as const;

const PlayLearningActivityPage: React.FC = () => {
  const { appState } = useApp();
  const mode = appState.selectedMode ?? 'home';
  const backTarget = mode === 'institution' ? '/institution' : '/home';

  const [ageBand, setAgeBand] = useState<number | null>(null);
  const [theme, setTheme] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyChoice>('');

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

    const missing: string[] = [];
    if (ageBand === null) missing.push('age band');
    if (!trimmedTheme) missing.push('theme');
    if (!trimmedGoal) missing.push('learning goal');
    if (!difficulty) missing.push('difficulty');
    if (missing.length > 0) {
      setErrorMessage(
        `Please fill in: ${missing.join(', ')}.`,
      );
      return;
    }

    const ageBandStr = AGE_BAND_TO_API_STRING[ageBand!] ?? String(ageBand);

    /* Clear previous quiz immediately so stale questions never flash */
    setActivity(null);
    setQuestionIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await generateLearningActivity(
        {
          age_band: ageBandStr,
          theme: trimmedTheme,
          learning_goal: trimmedGoal,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
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

  const canGenerate =
    ageBand !== null &&
    theme.trim().length > 0 &&
    learningGoal.trim().length > 0 &&
    difficulty !== '';

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
          {/* Back button only on the form screen */}
          {phase === 'form' && (
            <Box>
              <BackButton to={backTarget} />
            </Box>
          )}

          <KiddoCard
            hoverEffect={false}
            sx={{
              p: 4,
              background:
                'linear-gradient(160deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.2) 100%)',
              backdropFilter: 'blur(20px) saturate(155%)',
              WebkitBackdropFilter: 'blur(20px) saturate(155%)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}
          >
            {/* Quit button — top-right, only during active quiz */}
            {phase === 'quiz' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetQuizState}
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    fontWeight: 600,
                    borderRadius: 99,
                    px: 2,
                    '&:hover': {
                      borderColor: '#dc2626',
                      bgcolor: 'rgba(239,68,68,0.08)',
                    },
                  }}
                >
                  Quit quiz
                </Button>
              </Box>
            )}
            {phase === 'form' && (
              <Stack
                spacing={2.5}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background:
                      'linear-gradient(160deg, rgba(255,255,255,0.54) 0%, rgba(255,255,255,0.28) 100%)',
                    backdropFilter: 'blur(14px) saturate(145%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(145%)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
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
                <Typography variant="body1" color="text.secondary">
                  Create a short, kid-friendly quiz from a theme and learning goal you choose.
                  Questions and answer order are shuffled each time you play.
                </Typography>
                {errorMessage && (
                  <Alert severity="error" onClose={() => setErrorMessage('')}>
                    {errorMessage}
                  </Alert>
                )}

                <FormControl fullWidth required>
                  <InputLabel id="learning-activity-age-band-label" shrink>
                    Age band
                  </InputLabel>
                  <Select
                    labelId="learning-activity-age-band-label"
                    value={ageBand === null ? '' : ageBand}
                    label="Age band"
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected === '' || selected == null) {
                        return (
                          <Box component="span" sx={{ color: 'text.secondary' }}>
                            Select an age band
                          </Box>
                        );
                      }
                      const band = AGE_BANDS.find((b) => b.value === selected);
                      return band?.label ?? String(selected);
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setAgeBand(raw === '' ? null : Number(raw));
                    }}
                  >
                    {/* Satisfies MUI when value is ""; not shown in menu (renderValue handles copy). */}
                    <MenuItem value="" sx={{ display: 'none' }} disabled aria-hidden>
                      —
                    </MenuItem>
                    {AGE_BANDS.map((band) => (
                      <MenuItem key={band.value} value={band.value}>
                        {band.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Same bands as story preferences — choose who the quiz is for (nothing is pre-selected).
                  </FormHelperText>
                </FormControl>

                <Autocomplete
                  freeSolo
                  options={QUIZ_THEME_SUGGESTIONS}
                  value={theme}
                  onChange={(_, newValue) => setTheme(typeof newValue === 'string' ? newValue : '')}
                  inputValue={theme}
                  onInputChange={(_, newInputValue) => setTheme(newInputValue)}
                  fullWidth
                  selectOnFocus
                  handleHomeEndKeys
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Theme"
                      placeholder="e.g. Space, Animals — or open the list for ideas"
                      helperText="Open the field for suggestions, or type any topic for the quiz."
                    />
                  )}
                />

                <Autocomplete
                  freeSolo
                  options={QUIZ_LEARNING_GOAL_SUGGESTIONS}
                  value={learningGoal}
                  onChange={(_, newValue) => setLearningGoal(typeof newValue === 'string' ? newValue : '')}
                  inputValue={learningGoal}
                  onInputChange={(_, newInputValue) => setLearningGoal(newInputValue)}
                  fullWidth
                  selectOnFocus
                  handleHomeEndKeys
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Learning goal"
                      placeholder="e.g. Vocabulary, Science facts — or open the list"
                      helperText="Pick a suggestion or type what you want the quiz to focus on."
                    />
                  )}
                />

                <FormControl fullWidth required sx={{ maxWidth: 320 }}>
                  <InputLabel id="difficulty-label" shrink>
                    Difficulty
                  </InputLabel>
                  <Select
                    labelId="difficulty-label"
                    label="Difficulty"
                    value={difficulty}
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected === '' || selected == null) {
                        return (
                          <Box component="span" sx={{ color: 'text.secondary' }}>
                            Select difficulty
                          </Box>
                        );
                      }
                      if (selected === 'easy') return 'Easy';
                      if (selected === 'medium') return 'Medium';
                      if (selected === 'hard') return 'Hard';
                      return String(selected);
                    }}
                    onChange={(e) =>
                      setDifficulty((e.target.value as DifficultyChoice) || '')
                    }
                  >
                    <MenuItem value="" sx={{ display: 'none' }} disabled aria-hidden>
                      —
                    </MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                  <FormHelperText>Choose how challenging the questions should be.</FormHelperText>
                </FormControl>

                {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

                <KiddoButton
                  variant="contained"
                  color="secondary"
                  glow
                  onClick={handleGenerate}
                  disabled={loading || !canGenerate}
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

                <Stack spacing={1.5} sx={{ width: '100%' }}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const answered = selectedOption !== null;
                    const showCorrect = answered && idx === currentQuestion.correct_index;
                    const showWrong = isSelected && idx !== currentQuestion.correct_index;
                    const isIdle = !answered;
                    const palette = KID_OPTION_PALETTES[idx % KID_OPTION_PALETTES.length];

                    return (
                      <Button
                        key={`${questionIndex}-${idx}`}
                        fullWidth
                        disableElevation
                        variant="outlined"
                        onClick={() => handlePickOption(idx)}
                        disabled={answered}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          py: 1.15,
                          px: 1.75,
                          minHeight: 48,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '1rem',
                          lineHeight: 1.35,
                          borderWidth: 2,
                          borderStyle: 'solid',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          ...(isIdle && {
                            color: 'text.primary',
                            borderColor: palette.border,
                            background: palette.gradient,
                            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
                            '&:hover': {
                              borderColor: palette.border,
                              background: palette.gradient,
                              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.1)',
                              transform: 'translateY(-1px)',
                            },
                          }),
                          ...(answered && !showCorrect && !showWrong && {
                            color: 'text.secondary',
                            borderColor: alpha('#94a3b8', 0.65),
                            bgcolor: alpha('#f1f5f9', 0.85),
                            boxShadow: 'none',
                          }),
                          ...(showCorrect && {
                            color: '#ffffff',
                            borderColor: '#15803d',
                            background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 45%, #16a34a 100%)',
                            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                          }),
                          ...(showWrong && {
                            color: '#7f1d1d',
                            borderColor: '#dc2626',
                            background: 'linear-gradient(180deg, #fecaca 0%, #f87171 50%, #ef4444 100%)',
                            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.28)',
                          }),
                          '&.Mui-disabled': {
                            opacity: 1,
                            ...(showCorrect && {
                              color: '#ffffff',
                              borderColor: '#15803d',
                              background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 45%, #16a34a 100%)',
                              WebkitTextFillColor: '#ffffff',
                              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                            }),
                            ...(showWrong && {
                              color: '#7f1d1d',
                              borderColor: '#dc2626',
                              background: 'linear-gradient(180deg, #fecaca 0%, #f87171 50%, #ef4444 100%)',
                              WebkitTextFillColor: '#7f1d1d',
                              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.28)',
                            }),
                            ...(answered && !showCorrect && !showWrong && {
                              color: 'text.secondary',
                              borderColor: alpha('#94a3b8', 0.65),
                              bgcolor: alpha('#f1f5f9', 0.85),
                              WebkitTextFillColor: 'unset',
                              boxShadow: 'none',
                            }),
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          sx={{ width: '100%', pr: 0.25 }}
                        >
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              flexShrink: 0,
                              border: '2px solid',
                              ...(isIdle && {
                                bgcolor: palette.badgeBg,
                                color: palette.badgeColor,
                                borderColor: palette.border,
                              }),
                              ...(answered && !showCorrect && !showWrong && {
                                bgcolor: alpha('#fff', 0.7),
                                color: 'text.secondary',
                                borderColor: alpha('#94a3b8', 0.5),
                              }),
                              ...(showCorrect && {
                                bgcolor: alpha('#fff', 0.28),
                                color: '#ffffff',
                                borderColor: alpha('#fff', 0.65),
                              }),
                              ...(showWrong && {
                                bgcolor: alpha('#fff', 0.85),
                                color: '#b91c1c',
                                borderColor: '#dc2626',
                              }),
                            }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </Box>
                          <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>
                            {opt}
                          </Box>
                          {answered && showCorrect && (
                            <CheckCircle2 size={22} strokeWidth={2.5} color="#ffffff" aria-hidden />
                          )}
                          {answered && showWrong && (
                            <XCircle size={22} strokeWidth={2.5} color="#7f1d1d" aria-hidden />
                          )}
                        </Stack>
                      </Button>
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

            {phase === 'complete' && activity && (() => {
              const total = activity.questions.length;
              const filledStars = Math.round((correctCount / total) * 3);
              const isPerfect = filledStars === 3;
              const isGood = filledStars === 2;
              const celebrationLevel: 'high' | 'mid' | null =
                isPerfect ? 'high' : isGood ? 'mid' : null;

              const RESULT_CONFIG = [
                {
                  heading: 'Keep trying! You\'ve got this! 💪',
                  sub: 'Every quiz makes you smarter. Give it another go!',
                  gradient: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                },
                {
                  heading: 'Nice try! You can do better! 🙂',
                  sub: 'You\'re on the right track. A little more practice!',
                  gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                },
                {
                  heading: 'Good job! Keep going! 🌈',
                  sub: 'Almost there — just a bit more and you\'ll nail it!',
                  gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                },
                {
                  heading: 'Amazing! 🎉 You did great!',
                  sub: 'Perfect score! You\'re a superstar — well done!',
                  gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7C948 100%)',
                },
              ];
              const cfg = RESULT_CONFIG[Math.min(filledStars, 3)];

              return (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    /* subtle background tint for the result section */
                    background: isPerfect
                      ? 'linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)'
                      : isGood
                        ? 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)'
                        : 'transparent',
                    p: { xs: 2, sm: 3 },
                  }}
                >
                  {/* confetti + sparkles overlay */}
                  {celebrationLevel && <CelebrationEffect level={celebrationLevel} />}

                  <Stack
                    spacing={2.5}
                    alignItems="center"
                    sx={{ textAlign: 'center', width: '100%', position: 'relative', zIndex: 1 }}
                  >
                    {/* Stars */}
                    <StarRating filledStars={filledStars} pulse={isPerfect} />

                    {/* Animated feedback badge */}
                    <Box
                      sx={{
                        opacity: 0,
                        transform: 'translateY(12px)',
                        animation: 'resultFadeUp 0.5s ease 0.7s forwards',
                        '@keyframes resultFadeUp': {
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          background: cfg.gradient,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          lineHeight: 1.3,
                        }}
                      >
                        {cfg.heading}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontStyle: 'italic' }}
                      >
                        {cfg.sub}
                      </Typography>
                    </Box>

                    {/* Score chip */}
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 2.5,
                        py: 0.75,
                        borderRadius: 99,
                        border: '2px solid',
                        borderColor: isPerfect ? '#F7C948' : isGood ? '#3B82F6' : 'divider',
                        bgcolor: 'background.paper',
                        boxShadow: isPerfect ? '0 0 12px rgba(247,201,72,0.35)' : 'none',
                        opacity: 0,
                        animation: 'resultFadeUp 0.5s ease 0.95s forwards',
                        '@keyframes resultFadeUp': {
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {correctCount} / {total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        correct in <em>{activity.title}</em>
                      </Typography>
                    </Box>

                    {/* Action buttons */}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      justifyContent="center"
                      sx={{ width: '100%', pt: 0.5 }}
                    >
                      <KiddoButton
                        variant="contained"
                        color="secondary"
                        glow
                        onClick={handleGenerate}
                        disabled={loading}
                      >
                        New quiz (same settings)
                      </KiddoButton>
                      <KiddoButton
                        variant="outlined"
                        onClick={resetQuizState}
                        sx={{
                          borderColor: '#6366F1',
                          color: '#6366F1',
                          '&:hover': {
                            borderColor: '#4F46E5',
                            bgcolor: 'rgba(99, 102, 241, 0.08)',
                          },
                        }}
                      >
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
                </Box>
              );
            })()}
          </KiddoCard>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default PlayLearningActivityPage;
