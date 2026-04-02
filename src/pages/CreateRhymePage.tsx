import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  keyframes,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Heart,
  Mic,
  MicOff,
  RotateCcw,
  Shuffle,
  BookOpen,
  Pencil,
  X,
} from "lucide-react";
import { ImageUploadButton } from "../components/story-creation/ImageUploadButton";
import { buildImageContext, processImageFiles } from "../utils/imageProcessing";
import type { ImageAttachment } from "../types/storyOptions";
import { AppShellLayout, KiddoButton, KiddoCard } from "../components";
import { LearningWorldScene } from "../components/LearningWorldScene";
import BackButton from "../components/BackButton";
import { useApp } from "../context/AppContext";
import { generateRhyme, saveFavoriteStory } from "../utils/aiApi";
import { saveRecommendationActivity, sanitizeTopic } from "../utils/recommendationActivity";
import { TONES } from "../types/storyOptions";
import {
  buildRhymePrompt,
  RHYME_STYLES,
  RHYME_PATTERNS,
  RHYME_PURPOSES,
  LEARNING_FOCUSES,
  type RhymeLength,
  type RhymeStyle,
  type RhymePattern,
} from "../utils/rhymePrompt";

// ── Animations ────────────────────────────────────────────────────────────────
const micPulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
  70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

// ── Topic starter chips ───────────────────────────────────────────────────────
const QUICK_TOPICS = [
  { label: "Bedtime", prompt: "sleepy stars and cozy blankets" },
  { label: "Animals", prompt: "a friendly puppy and a curious kitten" },
  { label: "Space", prompt: "a rocket ship visiting the moon" },
  { label: "Dinosaurs", prompt: "a tiny dinosaur who loves to dance" },
  { label: "Counting", prompt: "counting from one to ten with balloons" },
  { label: "Friendship", prompt: "sharing toys and helping friends" },
  { label: "Rainbow", prompt: "the colors of a bright rainbow after rain" },
  { label: "Ocean", prompt: "splashing waves and friendly fish in the sea" },
  { label: "Seasons", prompt: "leaves falling in autumn and snowflakes in winter" },
  { label: "Birthday", prompt: "birthday cake, candles, and a big celebration" },
  { label: "Superheroes", prompt: "a brave little superhero saving the day" },
  { label: "Nature", prompt: "butterflies, flowers, and bees in a garden" },
] as const;

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
  childName: "",
  age: 6,
  topic: "",
  rhymeStyle: "nursery" as RhymeStyle,
  rhymePattern: "aabb" as RhymePattern,
  rhymeLength: "short" as RhymeLength,
  tone: "",
  rhymePurpose: "",
  learningFocus: "",
};

const LENGTH_LABELS: Record<RhymeLength, string> = {
  short: "Short",
  medium: "Medium",
  long: "Longer",
};

// ── Component ─────────────────────────────────────────────────────────────────
const CreateRhymePage: React.FC = () => {
  const { appState } = useApp();

  // Input state
  const [childName, setChildName] = useState(DEFAULTS.childName);
  const [age, setAge] = useState<number>(DEFAULTS.age);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [rhymeStyle, setRhymeStyle] = useState<RhymeStyle>(DEFAULTS.rhymeStyle);
  const [rhymePattern, setRhymePattern] = useState<RhymePattern>(DEFAULTS.rhymePattern);
  const [rhymeLength, setRhymeLength] = useState<RhymeLength>(DEFAULTS.rhymeLength);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [rhymePurpose, setRhymePurpose] = useState(DEFAULTS.rhymePurpose);
  const [learningFocus, setLearningFocus] = useState(DEFAULTS.learningFocus);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscription, setVoiceTranscription] = useState<string | null>(null);

  // Image input state
  const [uploadedImages, setUploadedImages] = useState<ImageAttachment[]>([]);
  const [imageError, setImageError] = useState("");
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Refs for voice recognition
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const isStartingRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const topicRef = useRef(topic);
  const lastImagePromptRef = useRef("");
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Generation state
  const [rhyme, setRhyme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Output-card state
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [isFavoriteSaved, setIsFavoriteSaved] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Keep topicRef in sync for voice handler closure
  useEffect(() => { topicRef.current = topic; }, [topic]);

  // ── Voice recognition setup ───────────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isStartingRef.current) return;
    isStartingRef.current = true;
    try {
      recognitionRef.current.start();
    } catch {
      isStartingRef.current = false;
      shouldRestartRef.current = false;
      setVoiceError("Failed to start voice input. Please try again.");
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognitionConstructor =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionConstructor) {
      setIsVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-US";

    recognition.onstart = () => { isStartingRef.current = false; setIsRecording(true); };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalTranscript += t;
        else interimTranscript += t;
      }
      if (finalTranscript.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalTranscript}`.trim();
        const existing = topicRef.current ?? "";
        const spacer = existing.trim().length ? " " : "";
        const next = `${existing}${spacer}${finalTranscript.trim()}`;
        setTopic(next);
        topicRef.current = next;
        setVoiceTranscription(finalTranscriptRef.current);
      } else if (interimTranscript.trim()) {
        setVoiceTranscription(`${finalTranscriptRef.current} ${interimTranscript}`.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") {
        if (!shouldRestartRef.current) setIsRecording(false);
        return;
      }
      setVoiceError(
        event.error === "no-speech"
          ? "No speech detected. Please try again."
          : "Voice input failed. Please try again.",
      );
      if (event.error !== "no-speech") { shouldRestartRef.current = false; setIsRecording(false); }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = window.setTimeout(() => {
          if (!isStartingRef.current) startRecognition();
        }, 250);
        return;
      }
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return () => {
      shouldRestartRef.current = false;
      if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [startRecognition]);

  const handleMicClick = () => {
    if (!isVoiceSupported) {
      setVoiceError("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isRecording) {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    setVoiceError(null);
    shouldRestartRef.current = true;
    finalTranscriptRef.current = "";
    setVoiceTranscription(null);
    setIsRecording(true);
    startRecognition();
  };

  // ── Image handlers ────────────────────────────────────────────────────────────
  const buildImageSentence = (context: string) =>
    context ? `inspired by ${context}` : "";

  const upsertImageContext = (nextContext: string) => {
    const nextSentence = buildImageSentence(nextContext);
    setTopic((prev) => {
      let next = prev.trimEnd();
      if (lastImagePromptRef.current && next.includes(lastImagePromptRef.current)) {
        next = next.replace(lastImagePromptRef.current, "").trimEnd();
      }
      if (nextSentence) {
        const separator = next ? ", " : "";
        next = `${next}${separator}${nextSentence}`;
        lastImagePromptRef.current = nextSentence;
      } else {
        lastImagePromptRef.current = "";
      }
      return next;
    });
  };

  const handleAddImages = async (files: File[]) => {
    if (!files.length) return;
    setIsProcessingImages(true);
    setImageError("");
    try {
      const attachments = await processImageFiles(files);
      setUploadedImages((prev) => {
        const next = [...prev, ...attachments];
        upsertImageContext(buildImageContext(next));
        return next;
      });
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Failed to process image. Please try again.",
      );
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImageError("");
    setUploadedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((img) => img.id !== id);
      upsertImageContext(buildImageContext(next));
      return next;
    });
  };

  const handleReplaceClick = (id: string) => {
    setReplaceTargetId(id);
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && replaceTargetId) {
      await handleReplaceImage(replaceTargetId, file);
    }
    event.target.value = "";
    setReplaceTargetId(null);
  };

  const handleReplaceImage = async (id: string, file: File) => {
    setImageError("");
    setIsProcessingImages(true);
    try {
      const [attachment] = await processImageFiles([file]);
      setUploadedImages((prev) => {
        const next = prev.map((img) => {
          if (img.id !== id) return img;
          URL.revokeObjectURL(img.previewUrl);
          return { ...attachment, id: img.id };
        });
        upsertImageContext(buildImageContext(next));
        return next;
      });
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Failed to process image. Please try again.",
      );
    } finally {
      setIsProcessingImages(false);
    }
  };

  // ── Derived mic UI values ─────────────────────────────────────────────────────
  const micColor = !isVoiceSupported
    ? "text.disabled"
    : isRecording
      ? "error.main"
      : voiceTranscription
        ? "success.main"
        : "primary.main";

  const micTooltipText = !isVoiceSupported
    ? "Voice input not supported (use Chrome or Edge)"
    : isRecording
      ? "Stop recording"
      : "Start voice input";

  // Derived labels
  const canGenerate = useMemo(
    () => childName.trim().length > 0 && age >= 1 && age <= 10,
    [childName, age],
  );
  const activeStyleLabel = RHYME_STYLES.find((s) => s.value === rhymeStyle)?.label ?? rhymeStyle;
  const activePatternLabel = RHYME_PATTERNS.find((p) => p.value === rhymePattern)?.label ?? rhymePattern;
  const activePurposeLabel = RHYME_PURPOSES.find((p) => p.value === rhymePurpose)?.label ?? "";
  const activeLearningLabel = LEARNING_FOCUSES.find((f) => f.value === learningFocus)?.label ?? "";

  const hasNonDefaultOptions =
    rhymeStyle !== DEFAULTS.rhymeStyle ||
    rhymePattern !== DEFAULTS.rhymePattern ||
    rhymeLength !== DEFAULTS.rhymeLength ||
    !!tone || !!activePurposeLabel || !!topic || !!activeLearningLabel;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleTopicChip = (prompt: string) =>
    setTopic((prev) => (prev === prompt ? "" : prompt));

  const handlePurposeChip = (value: string) =>
    setRhymePurpose((prev) => (prev === value ? "" : value));

  const handleLearningChip = (value: string) =>
    setLearningFocus((prev) => (prev === value ? "" : value));

  const handleSurpriseMe = () => {
    const t = QUICK_TOPICS[Math.floor(Math.random() * QUICK_TOPICS.length)];
    const styles = RHYME_STYLES.map((s) => s.value) as RhymeStyle[];
    const patterns = RHYME_PATTERNS.map((p) => p.value) as RhymePattern[];
    const lengths: RhymeLength[] = ["short", "medium", "long"];
    const toneOptions = [...TONES, ""] as string[];
    const purposeOptions = [...RHYME_PURPOSES.map((p) => p.value), ""];
    const focusOptions = [...LEARNING_FOCUSES.map((f) => f.value), ""];
    setTopic(t.prompt);
    setRhymeStyle(styles[Math.floor(Math.random() * styles.length)]);
    setRhymePattern(patterns[Math.floor(Math.random() * patterns.length)]);
    setRhymeLength(lengths[Math.floor(Math.random() * lengths.length)]);
    setTone(toneOptions[Math.floor(Math.random() * toneOptions.length)]);
    setRhymePurpose(purposeOptions[Math.floor(Math.random() * purposeOptions.length)]);
    setLearningFocus(focusOptions[Math.floor(Math.random() * focusOptions.length)]);
  };

  const handleReset = () => {
    setChildName(DEFAULTS.childName);
    setAge(DEFAULTS.age);
    setTopic(DEFAULTS.topic);
    setRhymeStyle(DEFAULTS.rhymeStyle);
    setRhymePattern(DEFAULTS.rhymePattern);
    setRhymeLength(DEFAULTS.rhymeLength);
    setTone(DEFAULTS.tone);
    setRhymePurpose(DEFAULTS.rhymePurpose);
    setLearningFocus(DEFAULTS.learningFocus);
    setRhyme("");
    setErrorMessage("");
    setIsFavoriteSaved(false);
    setFavoriteMessage("");
    setCopied(false);
    // Clear voice state
    shouldRestartRef.current = false;
    if (recognitionRef.current) recognitionRef.current.abort();
    setIsRecording(false);
    setVoiceTranscription(null);
    setVoiceError(null);
    finalTranscriptRef.current = "";
    // Clear image state
    setUploadedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
    setImageError("");
    lastImagePromptRef.current = "";
  };

  const handleGenerate = async () => {
    if (!appState.accessToken) {
      setErrorMessage("You are not authenticated. Please sign in again.");
      return;
    }
    if (!childName.trim()) {
      setErrorMessage("Please enter a child name to personalize the rhyme.");
      return;
    }
    if (age < 1 || age > 10) {
      setErrorMessage("Please choose an age between 1 and 10.");
      return;
    }
    try {
      setIsGenerating(true);
      setErrorMessage("");
      setIsFavoriteSaved(false);
      setFavoriteMessage("");
      setCopied(false);

      const purposeInstruction =
        RHYME_PURPOSES.find((p) => p.value === rhymePurpose)?.instruction ?? "";
      const learningInstruction =
        LEARNING_FOCUSES.find((f) => f.value === learningFocus)?.instruction ?? "";

      const prompt = buildRhymePrompt({
        childName: childName.trim(),
        age,
        topic: topic.trim(),
        style: rhymeStyle,
        pattern: rhymePattern,
        length: rhymeLength,
        tone,
        purposeInstruction,
        learningInstruction,
      });

      const response = await generateRhyme(prompt, age, appState.accessToken);
      setRhyme(response.story);
      saveRecommendationActivity(sanitizeTopic(topic.trim() || "rhyme"), age);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to generate a rhyme.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!appState.accessToken || !rhyme) return;
    try {
      setIsSavingFavorite(true);
      setFavoriteMessage("");
      const result = await saveFavoriteStory(
        topic.trim() || "rhyme",
        rhyme,
        age,
        appState.accessToken,
        "generate",
      );
      if (result.saved) {
        setIsFavoriteSaved(true);
        setFavoriteMessage("Saved to Favorites!");
      } else {
        setFavoriteMessage("Could not save right now. Please try again.");
      }
    } catch {
      setFavoriteMessage("Could not save right now. Please try again.");
    } finally {
      setIsSavingFavorite(false);
    }
  };

  const handleCopy = async () => {
    if (!rhyme) return;
    try {
      await navigator.clipboard.writeText(rhyme);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <AppShellLayout>
      <Box sx={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.35, pointerEvents: "none" }}>
        <LearningWorldScene />
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4}>
          <Box><BackButton /></Box>

          {/* ── Main card ── */}
          <KiddoCard hoverEffect={false} sx={{ p: 4 }}>
            <Stack spacing={3}>

              {/* ── Header + options toggle ── */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "flex-start" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 1,
                      background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                    }}
                  >
                    Create a Rhyme
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Generate a playful, personalized rhyme in seconds.
                  </Typography>
                </Box>

                <KiddoButton
                  variant="contained"
                  onClick={() => setOptionsOpen(!optionsOpen)}
                  startIcon={optionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  sx={{
                    alignSelf: { xs: "stretch", sm: "flex-start" },
                    background: "linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)",
                    boxShadow: "0 4px 14px rgba(78, 205, 196, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)",
                      boxShadow: "0 6px 20px rgba(78, 205, 196, 0.6)",
                    },
                  }}
                >
                  {optionsOpen ? "Hide options" : "Rhyme options"}
                </KiddoButton>
              </Stack>

              {/* ── Active-options summary — only when collapsed and something is non-default ── */}
              {!optionsOpen && hasNonDefaultOptions && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {rhymeStyle !== DEFAULTS.rhymeStyle && (
                    <Chip size="small" label={activeStyleLabel} variant="outlined" />
                  )}
                  {rhymePattern !== DEFAULTS.rhymePattern && (
                    <Chip size="small" label={activePatternLabel} variant="outlined" />
                  )}
                  {rhymeLength !== DEFAULTS.rhymeLength && (
                    <Chip size="small" label={LENGTH_LABELS[rhymeLength]} variant="outlined" />
                  )}
                  {tone && <Chip size="small" label={tone} color="primary" variant="outlined" />}
                  {activePurposeLabel && (
                    <Chip size="small" label={activePurposeLabel} color="secondary" variant="outlined" />
                  )}
                  {topic && (
                    <Chip
                      size="small"
                      label={
                        QUICK_TOPICS.find((q) => q.prompt === topic)?.label ?? "Custom topic"
                      }
                      variant="outlined"
                    />
                  )}
                  {activeLearningLabel && (
                    <Chip size="small" label={activeLearningLabel} color="success" variant="outlined" />
                  )}
                </Stack>
              )}

              {/* ════════════════════════════════════════════════════════════
                  COLLAPSIBLE OPTIONS PANEL
                  Contains: Style · Pattern · Length · Tone · Purpose ·
                             Quick-topic chips + Surprise me · Learning Focus
              ════════════════════════════════════════════════════════════ */}
              <Collapse in={optionsOpen}>
                <Stack spacing={3} sx={{ pt: 1, pb: 1 }}>

                  {/* ── Rhyme style ── */}
                  <FormControl fullWidth>
                    <InputLabel id="rhyme-style-label">Rhyme style</InputLabel>
                    <Select
                      labelId="rhyme-style-label"
                      label="Rhyme style"
                      value={rhymeStyle}
                      onChange={(e: SelectChangeEvent<RhymeStyle>) =>
                        setRhymeStyle(e.target.value as RhymeStyle)
                      }
                    >
                      {RHYME_STYLES.map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* ── Rhyme pattern ── */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Rhyme pattern</Typography>
                    <ToggleButtonGroup
                      exclusive
                      value={rhymePattern}
                      onChange={(_, v: RhymePattern | null) => v && setRhymePattern(v)}
                      fullWidth
                    >
                      {RHYME_PATTERNS.map((p) => (
                        <Tooltip key={p.value} title={p.hint} placement="top" arrow>
                          <ToggleButton
                            value={p.value}
                            sx={{ flex: 1, fontSize: "0.75rem", px: 1, py: 0.75 }}
                          >
                            {p.label}
                          </ToggleButton>
                        </Tooltip>
                      ))}
                    </ToggleButtonGroup>
                  </Box>

                  {/* ── Length ── */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Length</Typography>
                    <ToggleButtonGroup
                      exclusive
                      value={rhymeLength}
                      onChange={(_, v: RhymeLength | null) => v && setRhymeLength(v)}
                      fullWidth
                    >
                      <ToggleButton value="short">Short</ToggleButton>
                      <ToggleButton value="medium">Medium</ToggleButton>
                      <ToggleButton value="long">Longer</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* ── Tone ── */}
                  <FormControl fullWidth>
                    <InputLabel id="rhyme-tone-label">Tone (optional)</InputLabel>
                    <Select
                      labelId="rhyme-tone-label"
                      label="Tone (optional)"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    >
                      <MenuItem value=""><em>No preference</em></MenuItem>
                      {TONES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  {/* ── What is this rhyme for? ── */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                      What is this rhyme for? (optional)
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {RHYME_PURPOSES.map((item) => {
                        const isActive = rhymePurpose === item.value;
                        return (
                          <Chip
                            key={item.value}
                            label={item.label}
                            onClick={() => handlePurposeChip(item.value)}
                            clickable
                            color={isActive ? "secondary" : "default"}
                            variant={isActive ? "filled" : "outlined"}
                            sx={{
                              fontWeight: isActive ? 700 : 600,
                              "&:hover": { transform: "translateY(-2px)", boxShadow: 1 },
                              transition: "all 0.2s ease",
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* ── Quick-topic chips + Surprise me ── */}
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 1.5 }}
                    >
                      <Typography variant="subtitle2">
                        Quick ideas — tap to fill the topic:
                      </Typography>
                      <Tooltip title="Randomise topic, style, pattern, length, tone, purpose and learning focus all at once">
                        <Box
                          component="span"
                          onClick={handleSurpriseMe}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            color: "primary.main",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            userSelect: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          <Shuffle size={14} />
                          Surprise me
                        </Box>
                      </Tooltip>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {QUICK_TOPICS.map((item) => {
                        const isActive = topic === item.prompt;
                        return (
                          <Chip
                            key={item.label}
                            label={item.label}
                            onClick={() => handleTopicChip(item.prompt)}
                            clickable
                            color={isActive ? "primary" : "default"}
                            variant={isActive ? "filled" : "outlined"}
                            sx={{
                              fontWeight: isActive ? 700 : 600,
                              "&:hover": { transform: "translateY(-2px)", boxShadow: 1 },
                              transition: "all 0.2s ease",
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* ── Learning Focus ── */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <BookOpen size={18} color="#4ECDC4" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Learning Focus
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        — weave teaching into the rhyme (optional)
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {LEARNING_FOCUSES.map((item) => {
                        const isActive = learningFocus === item.value;
                        return (
                          <Chip
                            key={item.value}
                            label={item.label}
                            onClick={() => handleLearningChip(item.value)}
                            clickable
                            color={isActive ? "success" : "default"}
                            variant={isActive ? "filled" : "outlined"}
                            sx={{
                              fontWeight: isActive ? 700 : 600,
                              "&:hover": { transform: "translateY(-2px)", boxShadow: 1 },
                              transition: "all 0.2s ease",
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>

                </Stack>
              </Collapse>

              {/* ── Error ── */}
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              {/* ── Required: Name + Age ── */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Child Name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  helperText="Required for personalization"
                  fullWidth
                />
                <Box sx={{ minWidth: 220 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Age (1–10)</Typography>
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

              {/* ── Topic + image preview in one bordered box (same pattern as story creation) ── */}
              <Box
                sx={{
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -8,
                    left: -8,
                    right: -8,
                    bottom: -8,
                    background:
                      "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(78,205,196,0.1))",
                    borderRadius: 2,
                    zIndex: 0,
                  },
                }}
              >
                <Stack
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.23)",
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    "&:focus-within": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  {uploadedImages.length > 0 && (
                    <Box
                      sx={{
                        px: 1.5,
                        pt: 1.5,
                        pb: 1,
                        backgroundColor: "#fff",
                      }}
                    >
                      {imageError && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          {imageError}
                        </Alert>
                      )}
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ overflowX: "auto", pb: 0.5, alignItems: "flex-start" }}
                      >
                        {uploadedImages.map((image) => (
                          <Box
                            key={image.id}
                            sx={{
                              position: "relative",
                              flexShrink: 0,
                              width: 128,
                              borderRadius: 2,
                              overflow: "hidden",
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                              boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
                            }}
                          >
                            <Box
                              component="img"
                              src={image.previewUrl}
                              alt={image.caption}
                              title={image.caption}
                              sx={{
                                width: "100%",
                                height: 128,
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                display: "flex",
                                gap: 0.25,
                              }}
                            >
                              <Tooltip title="Replace image">
                                <IconButton
                                  size="small"
                                  aria-label="Replace image"
                                  onClick={() => handleReplaceClick(image.id)}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    p: 0,
                                    bgcolor: "rgba(255,255,255,0.95)",
                                    color: "text.primary",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                                    "&:hover": { bgcolor: "background.paper" },
                                  }}
                                >
                                  <Pencil size={14} strokeWidth={2.25} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove image">
                                <IconButton
                                  size="small"
                                  aria-label="Remove image"
                                  onClick={() => handleRemoveImage(image.id)}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    p: 0,
                                    bgcolor: "rgba(255,255,255,0.95)",
                                    color: "text.primary",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                                    "&:hover": { bgcolor: "background.paper" },
                                  }}
                                >
                                  <X size={14} strokeWidth={2.25} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                      <input
                        ref={replaceInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReplaceChange}
                        style={{ display: "none" }}
                      />
                    </Box>
                  )}

                  <Box sx={{ position: "relative", bgcolor: "#fff" }}>
                    <TextField
                      // label="Rhyme topic (optional)"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder='Describe what the rhyme should be about, or use Quick ideas above — or speak / upload a photo!'
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "transparent",
                          borderRadius: 0,
                        },
                        "& .MuiInputBase-inputMultiline": {
                          paddingRight: "5.5rem",
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        right: 12,
                        bottom: 12,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ImageUploadButton
                        variant="icon"
                        onAddImages={handleAddImages}
                        imagesCount={uploadedImages.length}
                        isProcessing={isProcessingImages}
                      />
                      <Tooltip title={micTooltipText}>
                        <span>
                          <IconButton
                            onClick={handleMicClick}
                            disabled={!isVoiceSupported}
                            sx={{
                              color: micColor,
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              border: "1px solid",
                              borderColor: micColor,
                              backgroundColor: isRecording
                                ? "rgba(239, 68, 68, 0.12)"
                                : "rgba(255, 255, 255, 0.95)",
                              boxShadow: "none",
                              animation: isRecording ? `${micPulse} 1.8s infinite` : "none",
                              "&:hover": {
                                borderColor: micColor,
                                backgroundColor: isRecording
                                  ? "rgba(239, 68, 68, 0.18)"
                                  : "rgba(255, 255, 255, 1)",
                              },
                              "&:disabled": {
                                borderColor: "text.disabled",
                                color: "text.disabled",
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                              },
                            }}
                          >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {imageError && uploadedImages.length === 0 && (
                <Alert severity="error">{imageError}</Alert>
              )}

              {/* ── Voice errors / live transcription ── */}
              {voiceError && (
                <Alert severity="warning" onClose={() => setVoiceError(null)}>
                  {voiceError}
                </Alert>
              )}
              {voiceTranscription && (
                <Alert
                  severity="info"
                  onClose={() => setVoiceTranscription(null)}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(78,205,196,0.15), rgba(69,182,73,0.15))",
                    borderLeft: "4px solid #4ECDC4",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "#4ECDC4" }}>
                    🎤 Voice Input:
                  </Typography>
                  <Typography variant="body2">{voiceTranscription}</Typography>
                </Alert>
              )}

              {/* ── Generate + Reset ── */}
              <Stack direction="row" spacing={1.5} alignItems="stretch">
                <KiddoButton
                  variant="contained"
                  glow
                  onClick={handleGenerate}
                  disabled={isGenerating || !canGenerate}
                  fullWidth
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    background: !canGenerate
                      ? "linear-gradient(135deg, #CCCCCC, #999999)"
                      : "linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)",
                    boxShadow: !canGenerate ? "none" : "0 6px 20px rgba(78, 205, 196, 0.4)",
                    "&:hover": {
                      background: !canGenerate
                        ? "linear-gradient(135deg, #CCCCCC, #999999)"
                        : "linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)",
                      boxShadow: !canGenerate ? "none" : "0 8px 26px rgba(78, 205, 196, 0.6)",
                    },
                  }}
                >
                  {isGenerating
                    ? "Creating your rhyme..."
                    : rhyme
                      ? "Generate Another Rhyme"
                      : "Generate Rhyme"}
                </KiddoButton>

                <Tooltip title="Reset all fields">
                  <span>
                    <KiddoButton
                      variant="outlined"
                      onClick={handleReset}
                      disabled={isGenerating}
                      sx={{
                        py: 2,
                        px: 2.5,
                        minWidth: "unset",
                        borderColor: "divider",
                        color: "text.secondary",
                        "&:hover": {
                          borderColor: "text.secondary",
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <RotateCcw size={20} />
                    </KiddoButton>
                  </span>
                </Tooltip>
              </Stack>

            </Stack>
          </KiddoCard>

          {/* ── Output card ── */}
          {rhyme && (
            <KiddoCard hoverEffect={false} sx={{ p: 4, position: "relative" }}>

              {/* Copy */}
              <Tooltip title={copied ? "Copied!" : "Copy rhyme"}>
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 60,
                    color: copied ? "success.main" : "text.secondary",
                    transition: "all 0.3s ease",
                    "&:hover": { color: "text.primary", transform: "scale(1.15)" },
                  }}
                >
                  {copied ? <Check size={22} /> : <Copy size={22} />}
                </IconButton>
              </Tooltip>

              {/* Save to Favorites */}
              <Tooltip
                title={
                  isFavoriteSaved ? "Saved!" : isSavingFavorite ? "Saving..." : "Save to Favorites"
                }
              >
                <IconButton
                  onClick={handleSaveFavorite}
                  disabled={isSavingFavorite || isFavoriteSaved}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: isFavoriteSaved ? "#E91E63" : "#999",
                    transition: "all 0.3s ease",
                    "&:hover": { color: "#E91E63", transform: "scale(1.15)" },
                    "&:active": { transform: "scale(0.95)" },
                  }}
                >
                  <Heart size={28} fill={isFavoriteSaved ? "#E91E63" : "none"} strokeWidth={2} />
                </IconButton>
              </Tooltip>

              <Stack spacing={2}>
                <Typography variant="h5" sx={{ fontWeight: 700, pr: 12 }}>
                  Your Rhyme
                </Typography>

                {/* Applied-settings tags */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={activeStyleLabel} variant="outlined" />
                  <Chip size="small" label={activePatternLabel} variant="outlined" />
                  <Chip size="small" label={LENGTH_LABELS[rhymeLength]} variant="outlined" />
                  {tone && <Chip size="small" label={tone} color="primary" variant="outlined" />}
                  {activePurposeLabel && (
                    <Chip size="small" label={activePurposeLabel} color="secondary" variant="outlined" />
                  )}
                  {activeLearningLabel && (
                    <Chip
                      size="small"
                      label={activeLearningLabel}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {favoriteMessage && (
                  <Alert severity={isFavoriteSaved ? "success" : "warning"}>
                    {favoriteMessage}
                  </Alert>
                )}

                <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
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
