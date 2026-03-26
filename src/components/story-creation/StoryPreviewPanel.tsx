import React from "react";
import {
  Box,
  Stack,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Button,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heart } from "lucide-react";
import { KiddoCard } from "../index";
import type { StoryVideoImageProvider } from "../../utils/aiApi";

interface StoryPreviewPanelProps {
  generatedStory: string;
  rewrittenStory: string;
  generatedStoryAudioSrc?: string | null;
  rewrittenStoryAudioSrc?: string | null;
  onSaveFavorite: () => void;
  isSavingFavorite: boolean;
  isFavoriteSaved: boolean;
  favoriteMessage: string;
  errorMessage: string;
  onWatchStoryVideo?: () => void;
  isStoryVideoLoading?: boolean;
  storyVideoUrl?: string | null;
  storyVideoError?: string;
  includeStoryVideoVoice?: boolean;
  onToggleStoryVideoVoice?: (next: boolean) => void;
  storyVideoImageProvider?: StoryVideoImageProvider;
  onStoryVideoImageProviderChange?: (next: StoryVideoImageProvider) => void;
}

export const StoryPreviewPanel: React.FC<StoryPreviewPanelProps> = ({
  generatedStory,
  rewrittenStory,
  generatedStoryAudioSrc,
  rewrittenStoryAudioSrc,
  onSaveFavorite,
  isSavingFavorite,
  isFavoriteSaved,
  favoriteMessage,
  errorMessage,
  onWatchStoryVideo,
  isStoryVideoLoading = false,
  storyVideoUrl = null,
  storyVideoError = "",
  includeStoryVideoVoice = false,
  onToggleStoryVideoVoice,
  storyVideoImageProvider = "gemini",
  onStoryVideoImageProviderChange,
}) => {
  return (
    <KiddoCard hoverEffect={false} sx={{ p: 4, position: "relative" }}>
      {/* Heart Icon - Top Right */}
      <Tooltip 
        title={
          isFavoriteSaved 
            ? "Saved to Favorites!" 
            : isSavingFavorite 
            ? "Saving..." 
            : "Save to Favorites"
        }
      >
        <IconButton
          onClick={onSaveFavorite}
          disabled={isSavingFavorite || isFavoriteSaved}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: isFavoriteSaved ? "#E91E63" : "#999",
            transition: "all 0.3s ease",
            "&:hover": {
              color: "#E91E63",
              transform: "scale(1.15)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          <Heart 
            size={32} 
            fill={isFavoriteSaved ? "#E91E63" : "none"} 
            strokeWidth={2}
          />
        </IconButton>
      </Tooltip>

      <Stack spacing={3}>
        {/* Feedback Messages */}
        {favoriteMessage && (
          <Alert severity={isFavoriteSaved ? "success" : "warning"}>
            {favoriteMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error">
            {errorMessage}
          </Alert>
        )}

        {storyVideoError && (
          <Alert severity="error">{storyVideoError}</Alert>
        )}

        {onWatchStoryVideo && (
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} flexWrap="wrap">
              <Button
                variant="contained"
                color="secondary"
                onClick={onWatchStoryVideo}
                disabled={isStoryVideoLoading}
              >
                {isStoryVideoLoading ? "Creating video…" : "Watch Story Video"}
              </Button>
              {onStoryVideoImageProviderChange && (
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="story-video-image-provider-label">Illustrations</InputLabel>
                  <Select
                    labelId="story-video-image-provider-label"
                    label="Illustrations"
                    value={storyVideoImageProvider}
                    onChange={(e) =>
                      onStoryVideoImageProviderChange(e.target.value as StoryVideoImageProvider)
                    }
                    disabled={isStoryVideoLoading}
                  >
                    <MenuItem value="gemini">Gemini (free tier, AI Studio key)</MenuItem>
                    <MenuItem value="huggingface">Hugging Face Inference</MenuItem>
                  </Select>
                </FormControl>
              )}
              {onToggleStoryVideoVoice && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeStoryVideoVoice}
                      onChange={(e) => onToggleStoryVideoVoice(e.target.checked)}
                      disabled={isStoryVideoLoading}
                    />
                  }
                  label="Include voice (narration)"
                />
              )}
            </Stack>
            {isStoryVideoLoading && <LinearProgress />}
            {storyVideoUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Story video
                </Typography>
                <Box
                  component="video"
                  src={storyVideoUrl}
                  controls
                  playsInline
                  sx={{ width: "100%", maxWidth: 640, borderRadius: 2, bgcolor: "#000" }}
                />
              </Box>
            )}
          </Stack>
        )}

        {/* Generated Story */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, pr: 5 }}>
            📖 Your Story
          </Typography>
          {generatedStoryAudioSrc && (
            <Box sx={{ mb: 2 }}>
              <audio controls preload="none" src={generatedStoryAudioSrc}>
                Your browser does not support audio playback.
              </audio>
            </Box>
          )}
          <Box
            sx={{
              typography: "body1",
              lineHeight: 1.8,
              "& p": { mb: 2 },
              "& h1, & h2, & h3": { mt: 3, mb: 2, fontWeight: 600 },
              "& strong": { fontWeight: 700, color: "primary.main" },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {generatedStory}
            </ReactMarkdown>
          </Box>
        </Box>

        {/* Rewritten Story */}
        {rewrittenStory && (
          <Box
            sx={{
              pt: 3,
              borderTop: "2px solid",
              borderColor: "primary.light",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
              ✨ Refined Story
            </Typography>
            {rewrittenStoryAudioSrc && (
              <Box sx={{ mb: 2 }}>
                <audio controls preload="none" src={rewrittenStoryAudioSrc}>
                  Your browser does not support audio playback.
                </audio>
              </Box>
            )}
            <Box
              sx={{
                typography: "body1",
                lineHeight: 1.8,
                "& p": { mb: 2 },
                "& h1, & h2, & h3": { mt: 3, mb: 2, fontWeight: 600 },
                "& strong": { fontWeight: 700, color: "primary.main" },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {rewrittenStory}
              </ReactMarkdown>
            </Box>
          </Box>
        )}
      </Stack>
    </KiddoCard>
  );
};
