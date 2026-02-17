import React, { useState } from "react";
import { Stack } from "@mui/material";
import { AppShellLayout } from "../components";
import { useApp } from "../context/AppContext";
import { UnifiedStoryInput } from "../components/story-creation/UnifiedStoryInput";
import { StoryPreviewPanel } from "../components/story-creation/StoryPreviewPanel";
import { generateStorySample, saveFavoriteStory } from "../utils/aiApi";

export const CreateStoryUnifiedPage: React.FC = () => {
  const { appState } = useApp();

  // Input state - NO personal data stored
  const [textPrompt, setTextPrompt] = useState("");
  const [voiceTranscription, setVoiceTranscription] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  
  // Story preferences (session-only)
  const [ageBand, setAgeBand] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [learningGoal, setLearningGoal] = useState("Just for fun");
  const [storyType, setStoryType] = useState("");
  const [storyLength, setStoryLength] = useState<"short" | "medium" | "long">("medium");
  const [currentMood, setCurrentMood] = useState("");
  const [language, setLanguage] = useState("en");

  // Generated story state
  const [generatedStory, setGeneratedStory] = useState("");
  const [rewrittenStory, setRewrittenStory] = useState("");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [isFavoriteSaved, setIsFavoriteSaved] = useState(false);

  const buildCombinedPrompt = (): string => {
    let prompt = textPrompt.trim();

    // Add voice transcription
    if (voiceTranscription) {
      prompt += ` ${voiceTranscription}`;
    }

    // Add image context
    if (imageAnalysis) {
      prompt = `Based on this image showing ${imageAnalysis}, ${prompt}`;
    }

    // Add age band
    if (ageBand) {
      const ageBandLabels: { [key: number]: string } = {
        1: "1-2 year old toddler",
        3: "3-4 year old preschooler",
        5: "5-6 year old kindergartener",
        7: "7-8 year old early elementary student",
        9: "9-10 year old elementary student",
        11: "11-12 year old middle schooler",
      };
      prompt += ` for a ${ageBandLabels[ageBand]}`;
    }

    // Add interests
    if (interests.length > 0) {
      prompt += ` with themes of ${interests.join(", ")}`;
    }

    // Add tone
    if (tone) {
      prompt += `. Make it ${tone.toLowerCase()}`;
    }

    // Add story type
    if (storyType) {
      prompt += `. Story type: ${storyType}`;
    }

    // Add learning goal
    if (learningGoal && learningGoal !== "Just for fun") {
      prompt += `. Focus on teaching: ${learningGoal}`;
    }

    // Add current mood
    if (currentMood) {
      prompt += `. The child is feeling ${currentMood.toLowerCase()} right now`;
    }

    // Add story length
    const lengthMap = {
      short: "Keep it short (2-3 minutes)",
      medium: "Make it medium length (5 minutes)",
      long: "Make it a longer story (8-10 minutes)",
    };
    prompt += `. ${lengthMap[storyLength]}.`;

    return prompt;
  };

  const handleGenerate = async () => {
    const combinedPrompt = buildCombinedPrompt();

    if (!combinedPrompt || combinedPrompt.length < 10) {
      setErrorMessage("Please enter more details about the story you'd like.");
      return;
    }

    if (!appState.accessToken) {
      setErrorMessage("You are not authenticated. Please sign in again.");
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage("");
      setRewrittenStory("");
      setFavoriteMessage("");
      setIsFavoriteSaved(false);

      const response = await generateStorySample(
        combinedPrompt,
        appState.accessToken
      );
      
      // If this is a refinement (story already exists), set as rewritten story
      if (generatedStory) {
        setRewrittenStory(response.output);
      } else {
        setGeneratedStory(response.output);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to generate story.";
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFavorite = async () => {
    const storyToSave = rewrittenStory || generatedStory;
    if (!storyToSave) {
      setErrorMessage("Please generate a story before saving favorite.");
      return;
    }

    if (!appState.accessToken) {
      setErrorMessage("You are not authenticated. Please sign in again.");
      return;
    }

    try {
      setIsSavingFavorite(true);
      setErrorMessage("");
      setFavoriteMessage("");
      
      // Use ageBand if set, otherwise default to 7 (general audience)
      const ageToUse = ageBand || 7;
      
      const response = await saveFavoriteStory(
        buildCombinedPrompt(),
        storyToSave,
        ageToUse,
        appState.accessToken
      );
      if (response.saved) {
        setIsFavoriteSaved(true);
      }
      setFavoriteMessage(response.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save favorite story.";
      setErrorMessage(message);
    } finally {
      setIsSavingFavorite(false);
    }
  };

  const handleImageUpload = (file: File, analysis: string) => {
    setUploadedImage(file);
    setImageAnalysis(analysis);
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setImageAnalysis(null);
  };

  return (
    <AppShellLayout>
      <Stack spacing={3}>
        {/* Main Input Component */}
        <UnifiedStoryInput
          textPrompt={textPrompt}
          setTextPrompt={setTextPrompt}
          voiceTranscription={voiceTranscription}
          setVoiceTranscription={setVoiceTranscription}
          uploadedImage={uploadedImage}
          imageAnalysis={imageAnalysis}
          handleImageUpload={handleImageUpload}
          handleImageRemove={handleImageRemove}
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
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          hasExistingStory={!!generatedStory}
        />

        {/* Story Preview and Refinement */}
        {generatedStory && (
          <StoryPreviewPanel
            generatedStory={generatedStory}
            rewrittenStory={rewrittenStory}
            onSaveFavorite={handleSaveFavorite}
            isSavingFavorite={isSavingFavorite}
            isFavoriteSaved={isFavoriteSaved}
            favoriteMessage={favoriteMessage}
            errorMessage={errorMessage}
          />
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default CreateStoryUnifiedPage;
