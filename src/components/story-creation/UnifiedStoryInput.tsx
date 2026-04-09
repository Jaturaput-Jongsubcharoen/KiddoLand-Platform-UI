import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Alert,
  Collapse,
  Tooltip,
  IconButton,
  keyframes,
} from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Pencil,
  X,
} from "lucide-react";
import { KiddoCard, KiddoButton } from "../index";
import { QuickStarterChips } from "./QuickStarterChips";
import { ImageUploadButton } from "./ImageUploadButton";
import {
  AdvancedOptionsPanel,
  type InstitutionStoryContextFields,
} from "./AdvancedOptionsPanel";
import type { ImageAttachment } from "../../types/storyOptions";

interface UnifiedStoryInputProps {
  mode: "home" | "institution" | null;
  /** Classroom-only fields; omit in home mode. */
  institutionContext?: InstitutionStoryContextFields | null;
  childName: string;
  setChildName: (name: string) => void;
  textPrompt: string;
  setTextPrompt: (prompt: string) => void;
  voiceTranscription: string | null;
  setVoiceTranscription: (transcription: string | null) => void;
  uploadedImages: ImageAttachment[];
  imageAnalysis: string | null;
  imageError?: string;
  onAddImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onReplaceImage: (id: string, file: File) => void;
  isProcessingImages?: boolean;
  ageBand: number | null;
  setAgeBand: (age: number | null) => void;
  interests: string[];
  setInterests: (interests: string[]) => void;
  tone: string;
  setTone: (tone: string) => void;
  learningGoal: string;
  setLearningGoal: (goal: string) => void;
  storyType: string;
  setStoryType: (type: string) => void;
  storyLength: "short" | "medium" | "long";
  setStoryLength: (length: "short" | "medium" | "long") => void;
  currentMood: string;
  setCurrentMood: (mood: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  detectedSummary: string;
  onGenerate: () => void;
  onReset?: () => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  isGenerating: boolean;
  errorMessage: string;
  hasExistingStory: boolean;
}

const micPulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
`;

export const UnifiedStoryInput: React.FC<UnifiedStoryInputProps> = ({
  mode,
  institutionContext,
  childName,
  setChildName,
  textPrompt,
  setTextPrompt,
  voiceTranscription,
  setVoiceTranscription,
  uploadedImages,
  imageAnalysis,
  imageError,
  onAddImages,
  onRemoveImage,
  onReplaceImage,
  isProcessingImages = false,
  ageBand,
  setAgeBand,
  interests,
  setInterests,
  tone,
  setTone,
  learningGoal,
  setLearningGoal,
  storyType,
  setStoryType,
  storyLength,
  setStoryLength,
  currentMood,
  setCurrentMood,
  language,
  setLanguage,
  detectedSummary,
  onGenerate,
  onReset,
  isTtsEnabled,
  onToggleTts,
  isGenerating,
  errorMessage,
  hasExistingStory,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() => mode === "institution");
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const isStartingRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const setTextPromptRef = useRef(setTextPrompt);
  const setVoiceTranscriptionRef = useRef(setVoiceTranscription);
  const textPromptRef = useRef(textPrompt);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextPrompt(event.target.value);
  };

  const handleQuickStarter = (template: string) => {
    setTextPrompt(template);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && event.ctrlKey) {
      onGenerate();
    }
  };

  const handleReplaceClick = (id: string) => {
    setReplaceTargetId(id);
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && replaceTargetId) {
      onReplaceImage(replaceTargetId, file);
    }
    event.target.value = "";
    setReplaceTargetId(null);
  };

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      isStartingRef.current = false;
      shouldRestartRef.current = false;
      setVoiceError("Failed to start voice input. Please try again.");
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    setTextPromptRef.current = setTextPrompt;
  }, [setTextPrompt]);

  useEffect(() => {
    textPromptRef.current = textPrompt;
  }, [textPrompt]);

  useEffect(() => {
    setVoiceTranscriptionRef.current = setVoiceTranscription;
  }, [setVoiceTranscription]);

  useEffect(() => {
    const SpeechRecognitionConstructor =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
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

    recognition.onstart = () => {
      isStartingRef.current = false;
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        finalTranscriptRef.current =
          `${finalTranscriptRef.current} ${finalTranscript}`.trim();
        const existingPrompt = textPromptRef.current ?? "";
        const spacer = existingPrompt.trim().length ? " " : "";
        const nextPrompt = `${existingPrompt}${spacer}${finalTranscript.trim()}`;
        setTextPromptRef.current(nextPrompt);
        textPromptRef.current = nextPrompt;
        setVoiceTranscriptionRef.current(finalTranscriptRef.current);
      } else if (interimTranscript.trim()) {
        setVoiceTranscriptionRef.current(
          `${finalTranscriptRef.current} ${interimTranscript}`.trim(),
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "aborted") {
        if (!shouldRestartRef.current) {
          setIsRecording(false);
        }
        return;
      }

      setVoiceError(
        event.error === "no-speech"
          ? "No speech detected. Please try again."
          : "Voice input failed. Please try again.",
      );

      if (event.error !== "no-speech") {
        shouldRestartRef.current = false;
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        if (restartTimeoutRef.current) {
          window.clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = window.setTimeout(() => {
          if (!isStartingRef.current) {
            startRecognition();
          }
        }, 250);
        return;
      }
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [startRecognition]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "en" ? "en-US" : language;
    }
  }, [language]);

  const handleMicClick = () => {
    if (!isVoiceSupported) {
      setVoiceError(
        "Voice input is not supported in this browser. Please use Chrome or Edge.",
      );
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
    setVoiceTranscriptionRef.current(null);
    setIsRecording(true);
    startRecognition();
  };

  const hasInstitutionExtras =
    mode === "institution" &&
    institutionContext &&
    (Boolean(institutionContext.subjectArea) ||
      Boolean(institutionContext.sessionSetting) ||
      Boolean(institutionContext.teachingFocus.trim()));

  // User can generate with any input — institution can lean on classroom fields + age band
  const hasAnyInput =
    textPrompt.trim() ||
    voiceTranscription ||
    uploadedImages.length > 0 ||
    interests.length > 0 ||
    tone ||
    storyType ||
    learningGoal !== "Just for fun" ||
    currentMood ||
    language !== "en" ||
    ageBand ||
    (mode === "home" && childName) ||
    hasInstitutionExtras;

  const canGenerate = hasAnyInput;

  const micColor = !isVoiceSupported
    ? "text.disabled"
    : isRecording
      ? "error.main"
      : voiceTranscription
        ? "success.main"
        : "primary.main";

  const micTooltipText = !isVoiceSupported
    ? "Voice input not supported in this browser"
    : voiceError
      ? voiceError
      : isRecording
        ? "Click to stop recording"
        : "Click to start voice input";

  const ttsColor = isTtsEnabled ? "primary.main" : "error.main";

  return (
    <KiddoCard hoverEffect={false} sx={{ p: 4, borderRadius: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                }}
              >
                {mode === "institution" ? "Create a class story" : "Create a Story"}
              </Typography>
              <Tooltip title="Your data is not saved - privacy first!">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                    },
                  }}
                >
                  <Shield size={24} color="#4ECDC4" />
                </Box>
              </Tooltip>
            </Box>

            {/* Story Preferences Button - TOP RIGHT */}
            <KiddoButton
              variant="contained"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              startIcon={
                isAdvancedOpen ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )
              }
              sx={{
                background: "linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)",
                boxShadow: "0 4px 14px rgba(78, 205, 196, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)",
                  boxShadow: "0 6px 20px rgba(78, 205, 196, 0.6)",
                },
              }}
            >
              {isAdvancedOpen ? "Hide Preferences" : "Story Preferences"}
            </KiddoButton>
          </Box>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: "1.05rem",
              fontWeight: 500,
            }}
          >
            {mode === "institution" ? (
              <>
                Describe the story for your <strong>group</strong> — no individual names. Use{" "}
                <strong>Story Preferences</strong> for subject, setting, and age band.
              </>
            ) : (
              <>
                ✨ Tell KiddoLand what kind of story you’d like. We’ll keep it fun and age‑friendly!
              </>
            )}
          </Typography>
        </Box>

        {/* Advanced Options Panel - Directly below header */}
        <Collapse in={isAdvancedOpen}>
          <AdvancedOptionsPanel
            mode={mode}
            institutionContext={institutionContext ?? null}
            childName={childName}
            setChildName={setChildName}
            ageBand={ageBand}
            setAgeBand={setAgeBand}
            interests={interests}
            setInterests={setInterests}
            tone={tone}
            setTone={setTone}
            learningGoal={learningGoal}
            setLearningGoal={setLearningGoal}
            storyType={storyType}
            setStoryType={setStoryType}
            storyLength={storyLength}
            setStoryLength={setStoryLength}
            currentMood={currentMood}
            setCurrentMood={setCurrentMood}
            language={language}
            setLanguage={setLanguage}
          />
        </Collapse>

        {/* Error Message */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {/* Main text + image preview in one bordered box (matches “Tell me about…” area) */}
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
            <ImageUploadButton
              variant="icon"
              onAddImages={onAddImages}
              imagesCount={uploadedImages.length}
              isProcessing={isProcessingImages}
            />
            {/* <Tooltip
              title={
                isTtsEnabled
                  ? "Audio narration is ON (include_tts=true)"
                  : "Audio narration is OFF (include_tts=false)"
              }
            > */}
            {/* <IconButton
                aria-label={isTtsEnabled ? "Disable audio narration" : "Enable audio narration"}
                aria-pressed={isTtsEnabled}
                onClick={onToggleTts}
            {/* Image preview on top (same flat white as prompt area) */}
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
                              "&:hover": {
                                bgcolor: "background.paper",
                              },
                            }}
                          >
                            <Pencil size={14} strokeWidth={2.25} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove image">
                          <IconButton
                            size="small"
                            aria-label="Remove image"
                            onClick={() => onRemoveImage(image.id)}
                            sx={{
                              width: 28,
                              height: 28,
                              p: 0,
                              bgcolor: "rgba(255,255,255,0.95)",
                              color: "text.primary",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                              "&:hover": {
                                bgcolor: "background.paper",
                              },
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

            {/* Story prompt below preview, same outer border */}
            <Box
              sx={{
                position: "relative",
                bgcolor: "#fff",
              }}
            >
              <TextField
                multiline
                minRows={4}
                maxRows={10}
                value={textPrompt}
                onChange={handleTextChange}
                onKeyPress={handleKeyPress}
                placeholder="Example: Tell an exciting adventure story about a brave turtle going to space..."
                fullWidth
                inputProps={{
                  style: {
                    caretColor: "#000000",
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                    opacity: 1,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    backgroundColor: "transparent",
                    borderRadius: 0,
                  },
                  "& .MuiInputBase-input": {
                    caretColor: "#000000",
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-inputMultiline": {
                    paddingRight: "5.5rem",
                    caretColor: "#000000",
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1rem",
                    fontWeight: 600,
                  },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Tooltip
                  title={
                    isTtsEnabled
                      ? "Audio narration is ON (include_tts=true)"
                      : "Audio narration is OFF (include_tts=false)"
                  }
                >
                  <IconButton
                    aria-label={
                      isTtsEnabled
                        ? "Disable audio narration"
                        : "Enable audio narration"
                    }
                    aria-pressed={isTtsEnabled}
                    onClick={onToggleTts}
                    sx={{
                      color: ttsColor,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: "1px solid",
                      borderColor: ttsColor,
                      backgroundColor: isTtsEnabled
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(239, 68, 68, 0.12)",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: ttsColor,
                        backgroundColor: isTtsEnabled
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(239, 68, 68, 0.18)",
                      },
                    }}
                  >
                    {isTtsEnabled ? (
                      <Volume2 size={18} />
                    ) : (
                      <VolumeX size={18} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title={micTooltipText}>
                  <span>
                    <IconButton
                      aria-label={
                        isRecording ? "Stop voice input" : "Start voice input"
                      }
                      aria-pressed={isRecording}
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
                        animation: isRecording
                          ? `${micPulse} 1.8s infinite`
                          : "none",
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

        {/* Voice Transcription Display */}
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
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 0.5, color: "#4ECDC4" }}
            >
              🎤 Voice Input:
            </Typography>
            <Typography variant="body2">{voiceTranscription}</Typography>
            {detectedSummary && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                Detected: {detectedSummary}
              </Typography>
            )}
          </Alert>
        )}

        {/* Generate/Refine + Reset Buttons */}
        <Stack direction="row" spacing={1.5} alignItems="stretch">
          <KiddoButton
            variant="contained"
            glow
            onClick={onGenerate}
            disabled={isGenerating || !canGenerate}
            fullWidth
            sx={{
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 800,
              background: !canGenerate
                ? "linear-gradient(135deg, #CCCCCC, #999999)"
                : hasExistingStory
                  ? "linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)"
                  : "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
              boxShadow: !canGenerate
                ? "none"
                : hasExistingStory
                  ? "0 6px 20px rgba(156,39,176,0.4)"
                  : "0 6px 20px rgba(255,107,53,0.4)",
              "&:hover": {
                background: !canGenerate
                  ? "linear-gradient(135deg, #CCCCCC, #999999)"
                  : hasExistingStory
                    ? "linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)"
                    : "linear-gradient(135deg, #F7931E 0%, #FF6B35 100%)",
                boxShadow: !canGenerate
                  ? "none"
                  : hasExistingStory
                    ? "0 8px 28px rgba(156,39,176,0.6)"
                    : "0 8px 28px rgba(255,107,53,0.6)",
              },
            }}
          >
            {isGenerating
              ? hasExistingStory
                ? "✨ Refining Your Story..."
                : "✨ Creating Your Magic Story..."
              : hasExistingStory
                ? "🔄 Refine Story"
                : "🚀 Generate Story"}
          </KiddoButton>

          {onReset && (
            <Tooltip title="Reset all fields">
              <span>
                <KiddoButton
                  variant="outlined"
                  onClick={onReset}
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
          )}
        </Stack>
      </Stack>
    </KiddoCard>
  );
};
