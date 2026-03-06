import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Alert,
  Collapse,
  Tooltip,
} from "@mui/material";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { KiddoCard, KiddoButton } from "../index";
import { QuickStarterChips } from "./QuickStarterChips";
import { VoiceInputButton } from "./VoiceInputButton";
import { ImageUploadButton } from "./ImageUploadButton";
import { AdvancedOptionsPanel } from "./AdvancedOptionsPanel";

interface UnifiedStoryInputProps {
  mode: "home" | "institution" | null;
  childName: string;
  setChildName: (name: string) => void;
  textPrompt: string;
  setTextPrompt: (prompt: string) => void;
  voiceTranscription: string | null;
  setVoiceTranscription: (transcription: string | null) => void;
  uploadedImage: File | null;
  imageAnalysis: string | null;
  handleImageUpload: (file: File, analysis: string) => void;
  handleImageRemove: () => void;
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
  isGenerating: boolean;
  errorMessage: string;
  hasExistingStory: boolean;
}

export const UnifiedStoryInput: React.FC<UnifiedStoryInputProps> = ({
  mode,
  childName,
  setChildName,
  textPrompt,
  setTextPrompt,
  voiceTranscription,
  setVoiceTranscription,
  uploadedImage,
  imageAnalysis,
  handleImageUpload,
  handleImageRemove,
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
  isGenerating,
  errorMessage,
  hasExistingStory,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

  // User can generate with any input - age band is completely optional
  const hasAnyInput = 
    textPrompt.trim() || 
    voiceTranscription || 
    uploadedImage || 
    interests.length > 0 || 
    tone || 
    storyType || 
    learningGoal !== "Just for fun" || 
    currentMood || 
    language !== "en" || 
    ageBand ||
    childName;
  
  const canGenerate = hasAnyInput;

  return (
    <KiddoCard hoverEffect={false} sx={{ p: 4, borderRadius: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h4" sx={{ 
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
              }}>
                Create a Story
              </Typography>
              <Tooltip title="Your data is not saved - privacy first!">
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center",
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                  },
                }}>
                  <Shield size={24} color="#4ECDC4" />
                </Box>
              </Tooltip>
            </Box>
            
            {/* Story Preferences Button - TOP RIGHT */}
            <KiddoButton
              variant="contained"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              startIcon={isAdvancedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              sx={{ 
                background: 'linear-gradient(135deg, #4ECDC4 0%, #45B649 100%)',
                boxShadow: '0 4px 14px rgba(78, 205, 196, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45B649 0%, #4ECDC4 100%)',
                  boxShadow: '0 6px 20px rgba(78, 205, 196, 0.6)',
                },
              }}
            >
              {isAdvancedOpen ? "Hide Preferences" : "Story Preferences"}
            </KiddoButton>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ 
            fontSize: '1.05rem',
            fontWeight: 500,
          }}>
            ✨ Tell KiddoLand what kind of story you’d like. We’ll keep it fun and age‑friendly!
          </Typography>
        </Box>

        {/* Advanced Options Panel - Directly below header */}
        <Collapse in={isAdvancedOpen}>
          <AdvancedOptionsPanel
            mode={mode}
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

        {/* Main Text Input - Now with fun styling */}
        <Box sx={{ 
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(78,205,196,0.1))',
            borderRadius: 2,
            zIndex: 0,
          }
        }}>
          <TextField
            label="💭 Tell me about the story you'd like to create..."
            multiline
            minRows={4}
            maxRows={10}
            value={textPrompt}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder="Example: Tell an exciting adventure story about a brave turtle going to space..."
            fullWidth
            sx={{
              position: 'relative',
              zIndex: 1,
              "& .MuiInputBase-root": {
                fontSize: "1rem",
                lineHeight: 1.6,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
              },
              "& .MuiInputLabel-root": {
                fontSize: "1rem",
                fontWeight: 600,
              },
            }}
          />
        </Box>

        {/* Voice and Image Buttons - Centered and prominent */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{
            py: 1,
          }}
        >
          <VoiceInputButton
            onTranscribe={(transcription) => setVoiceTranscription(transcription)}
            currentTranscription={voiceTranscription}
          />
          <ImageUploadButton
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            uploadedImage={uploadedImage}
            imageAnalysis={imageAnalysis}
          />
        </Stack>

        {/* Voice Transcription Display */}
        {voiceTranscription && (
          <Alert
            severity="info"
            onClose={() => setVoiceTranscription(null)}
            sx={{
              background: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(69,182,73,0.15))',
              borderLeft: '4px solid #4ECDC4',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#4ECDC4' }}>
              🎤 Voice Input:
            </Typography>
            <Typography variant="body2">{voiceTranscription}</Typography>
            {detectedSummary && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Detected: {detectedSummary}
              </Typography>
            )}
          </Alert>
        )}

        {/* Image Analysis Display */}
        {imageAnalysis && (
          <Alert 
            severity="info" 
            onClose={handleImageRemove}
            sx={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(247,147,30,0.15))',
              borderLeft: '4px solid #FF6B35',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#FF6B35' }}>
              🖼️ Image Detected:
            </Typography>
            <Typography variant="body2">{imageAnalysis}</Typography>
          </Alert>
        )}

        {/* Generate/Refine Button - Big and colorful */}
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
              ? 'linear-gradient(135deg, #CCCCCC, #999999)'
              : hasExistingStory
              ? 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)'
              : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
            boxShadow: !canGenerate ? 'none' : hasExistingStory ? '0 6px 20px rgba(156,39,176,0.4)' : '0 6px 20px rgba(255,107,53,0.4)',
            '&:hover': {
              background: !canGenerate 
                ? 'linear-gradient(135deg, #CCCCCC, #999999)'
                : hasExistingStory
                ? 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)'
                : 'linear-gradient(135deg, #F7931E 0%, #FF6B35 100%)',
              boxShadow: !canGenerate ? 'none' : hasExistingStory ? '0 8px 28px rgba(156,39,176,0.6)' : '0 8px 28px rgba(255,107,53,0.6)',
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
      </Stack>
    </KiddoCard>
  );
};
