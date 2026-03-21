import React from "react";
import { Box, Stack, Typography, Alert, IconButton, Tooltip } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heart } from "lucide-react";
import { KiddoCard } from "../index";

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
