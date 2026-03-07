import React, { useState } from "react";
import { Box, Stack } from "@mui/material";
import { AppShellLayout } from "../components";
import { useApp } from "../context/AppContext";
import { UnifiedStoryInput } from "../components/story-creation/UnifiedStoryInput";
import { StoryPreviewPanel } from "../components/story-creation/StoryPreviewPanel";
import { generateStorySample, saveFavoriteStory } from "../utils/aiApi";
import {
  ageFromBand,
  buildDetectedSummary,
  cleanTranscript,
  extractStoryInfo,
  getLanguageLabel,
} from "../utils/nlp";
import BackButton from "../components/BackButton";

export const CreateStoryUnifiedPage: React.FC = () => {
  const { appState } = useApp();
  const mode = appState.selectedMode ?? "home";

  // Input state - NO personal data stored
  const [textPrompt, setTextPrompt] = useState("");
  const [voiceTranscription, setVoiceTranscription] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  
  // Story preferences (session-only)
  const [childName, setChildName] = useState("");
  const [exactAge, setExactAge] = useState<number | null>(null);
  const [ageBand, setAgeBand] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [tone, setTone] = useState("");
  const [learningGoal, setLearningGoal] = useState("Just for fun");
  const [storyType, setStoryType] = useState("");
  const [storyLength, setStoryLength] = useState<"short" | "medium" | "long">("medium");
  const [currentMood, setCurrentMood] = useState("");
  const [language, setLanguage] = useState("en");

  const [detectedSummary, setDetectedSummary] = useState("");

  // Generated story state
  const [generatedStory, setGeneratedStory] = useState("");
  const [rewrittenStory, setRewrittenStory] = useState("");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [isFavoriteSaved, setIsFavoriteSaved] = useState(false);

  const buildCombinedPrompt = (overrides?: {
    childName?: string;
    age?: number | null;
    language?: string;
  }): string => {
    const basePrompt = [textPrompt.trim(), voiceTranscription?.trim()]
      .filter(Boolean)
      .join(" ");

    let prompt = basePrompt;

    if (imageAnalysis) {
      prompt = `Based on this image showing ${imageAnalysis}, ${prompt || "create a story"}`;
    }

    const effectiveName = overrides?.childName ?? childName.trim();
    const effectiveAge = overrides?.age ?? exactAge ?? ageFromBand(ageBand);

    if (mode === "home" && (effectiveName || effectiveAge)) {
      const parts: string[] = [];
      if (effectiveName) parts.push(`for ${effectiveName}`);
      if (effectiveAge) parts.push(`age ${effectiveAge}`);
      if (parts.length > 0) {
        prompt += `${prompt ? ". " : ""}This story is ${parts.join(", ")}.`;
      }
    }

    if (mode === "institution" && effectiveAge) {
      prompt += `${prompt ? ". " : ""}This story is for students age ${effectiveAge}.`;
    }

    if (interests.length > 0) {
      prompt += `${prompt ? " " : ""}Include themes of ${interests.join(", ")}.`;
    }

    if (tone) {
      prompt += `${prompt ? " " : ""}Make it ${tone.toLowerCase()}.`;
    }

    if (storyType) {
      prompt += `${prompt ? " " : ""}Story type: ${storyType}.`;
    }

    if (learningGoal && learningGoal !== "Just for fun") {
      prompt += `${prompt ? " " : ""}Focus on teaching: ${learningGoal}.`;
    }

    if (currentMood) {
      prompt += `${prompt ? " " : ""}The child is feeling ${currentMood.toLowerCase()} right now.`;
    }

    const lengthMap = {
      short: "Keep it short (2-3 minutes).",
      medium: "Make it medium length (5 minutes).",
      long: "Make it a longer story (8-10 minutes).",
    };
    prompt += `${prompt ? " " : ""}${lengthMap[storyLength]}`;

    const languageToUse = overrides?.language ?? language;
    if (languageToUse && languageToUse !== "en") {
      const label = getLanguageLabel(languageToUse);
      prompt += `${prompt ? " " : ""}Write the story in ${label}.`;
    }

    return prompt.trim();
  };

  const applyExtraction = (extracted: ReturnType<typeof extractStoryInfo>) => {
    if (mode === "home" && extracted.childName && !childName) {
      setChildName(extracted.childName);
    }

    if (extracted.age && !ageBand && !exactAge) {
      setExactAge(extracted.age);
    }

    if (extracted.ageBand && !ageBand) {
      setAgeBand(extracted.ageBand);
    }

    if (extracted.interests.length > 0) {
      setInterests((prev) => Array.from(new Set([...prev, ...extracted.interests])));
    }

    if (extracted.tone && !tone) {
      setTone(extracted.tone);
    }

    if (extracted.learningGoal && learningGoal === "Just for fun") {
      setLearningGoal(extracted.learningGoal);
    }

    if (extracted.storyType && !storyType) {
      setStoryType(extracted.storyType);
    }

    if (extracted.currentMood && !currentMood) {
      setCurrentMood(extracted.currentMood);
    }

    if (extracted.storyLength && storyLength === "medium") {
      setStoryLength(extracted.storyLength);
    }

    if (extracted.language && language === "en") {
      setLanguage(extracted.language);
    }
  };

  const handleVoiceTranscription = (transcription: string | null) => {
    if (!transcription) {
      setVoiceTranscription(null);
      setDetectedSummary("");
      return;
    }

    const cleaned = cleanTranscript(transcription);
    setVoiceTranscription(cleaned);

    if (!cleaned) {
      setDetectedSummary("");
      return;
    }

    const extracted = extractStoryInfo(cleaned, mode);
    setDetectedSummary(buildDetectedSummary(extracted, mode));
    applyExtraction(extracted);
  };

  const handleAgeBandChange = (age: number | null) => {
    setAgeBand(age);
    if (age !== null) {
      setExactAge(null);
    }
  };

  const handleGenerate = async () => {
    const combinedInput = [textPrompt.trim(), voiceTranscription?.trim()]
      .filter(Boolean)
      .join(" ");

    const extracted = combinedInput ? extractStoryInfo(combinedInput, mode) : null;
    if (extracted) {
      applyExtraction(extracted);
    }

    const effectiveChildName =
      mode === "home" ? childName.trim() || extracted?.childName || "Kiddo" : "";
    const effectiveAge = exactAge ?? extracted?.age ?? ageFromBand(ageBand) ?? 7;
    const effectiveLanguage = language !== "en" ? language : extracted?.language ?? language;

    const combinedPrompt = buildCombinedPrompt({
      childName: effectiveChildName,
      age: effectiveAge,
      language: effectiveLanguage,
    });

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
      
      const combinedInput = [textPrompt.trim(), voiceTranscription?.trim()]
        .filter(Boolean)
        .join(" ");
      const extracted = combinedInput ? extractStoryInfo(combinedInput, mode) : null;
      const effectiveAge = exactAge ?? extracted?.age ?? ageFromBand(ageBand) ?? 7;
      
      const response = await saveFavoriteStory(
        buildCombinedPrompt({
          childName: mode === "home" ? childName.trim() || extracted?.childName || "Kiddo" : "",
          age: effectiveAge,
          language: language !== "en" ? language : extracted?.language ?? language,
        }),
        storyToSave,
        effectiveAge,
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
        <Box>
          <BackButton to="/home" />
        </Box>
        {/* Main Input Component */}
        <UnifiedStoryInput
          mode={mode}
          childName={childName}
          setChildName={setChildName}
          textPrompt={textPrompt}
          setTextPrompt={setTextPrompt}
          voiceTranscription={voiceTranscription}
          setVoiceTranscription={handleVoiceTranscription}
          uploadedImage={uploadedImage}
          imageAnalysis={imageAnalysis}
          handleImageUpload={handleImageUpload}
          handleImageRemove={handleImageRemove}
          ageBand={ageBand}
          setAgeBand={handleAgeBandChange}
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
          detectedSummary={detectedSummary}
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
