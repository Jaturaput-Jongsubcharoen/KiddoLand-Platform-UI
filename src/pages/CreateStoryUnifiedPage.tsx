import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack } from "@mui/material";
import { AppShellLayout } from "../components";
import { useApp } from "../context/AppContext";
import { UnifiedStoryInput } from "../components/story-creation/UnifiedStoryInput";
import { StoryPreviewPanel } from "../components/story-creation/StoryPreviewPanel";
import {
  generateStorySample,
  generateStoryVideo,
  parseStoryTtsDataUrl,
  saveFavoriteStory,
  type StoryVideoImageProvider,
} from "../utils/aiApi";
import { deriveTopicFromStoryContext, saveRecommendationActivity } from "../utils/recommendationActivity";
import {
  ageFromBand,
  buildDetectedSummary,
  cleanTranscript,
  extractStoryInfo,
  getLanguageLabel,
} from "../utils/nlp";
import { buildImageContext, processImageFiles } from "../utils/imageProcessing";
import type { ImageAttachment } from "../types/storyOptions";
import BackButton from "../components/BackButton";

export const CreateStoryUnifiedPage: React.FC = () => {
  const { appState } = useApp();
  const mode = appState.selectedMode ?? "home";

  // Input state - NO personal data stored
  const [textPrompt, setTextPrompt] = useState("");
  const [voiceTranscription, setVoiceTranscription] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<ImageAttachment[]>([]);
  const [imageError, setImageError] = useState("");
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  
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

  /** Institution / classroom-only (session-only; not persisted beyond story prefs UX) */
  const [institutionSubjectArea, setInstitutionSubjectArea] = useState("");
  const [institutionSessionSetting, setInstitutionSessionSetting] = useState("");
  const [institutionTeachingFocus, setInstitutionTeachingFocus] = useState("");

  const [detectedSummary, setDetectedSummary] = useState("");

  // Generated story state
  const [generatedStory, setGeneratedStory] = useState("");
  const [rewrittenStory, setRewrittenStory] = useState("");
  const [generatedStoryAudioSrc, setGeneratedStoryAudioSrc] = useState<string | null>(null);
  const [rewrittenStoryAudioSrc, setRewrittenStoryAudioSrc] = useState<string | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [isFavoriteSaved, setIsFavoriteSaved] = useState(false);
  const lastImagePromptRef = useRef("");

  const [isStoryVideoLoading, setIsStoryVideoLoading] = useState(false);
  const [storyVideoUrl, setStoryVideoUrl] = useState<string | null>(null);
  const [storyVideoError, setStoryVideoError] = useState("");
  const [includeStoryVideoVoice, setIncludeStoryVideoVoice] = useState(true);
  const [storyVideoImageProvider, setStoryVideoImageProvider] =
    useState<StoryVideoImageProvider>("gemini");

  const imageAnalysis = useMemo(
    () => (uploadedImages.length ? buildImageContext(uploadedImages) : ""),
    [uploadedImages]
  );

  useEffect(() => {
    return () => {
      if (storyVideoUrl) {
        URL.revokeObjectURL(storyVideoUrl);
      }
    };
  }, [storyVideoUrl]);

  const buildCombinedPrompt = (overrides?: {
    childName?: string;
    age?: number | null;
    language?: string;
  }): string => {
    const basePrompt = [textPrompt.trim(), voiceTranscription?.trim()]
      .filter(Boolean)
      .join(" ");

    let prompt = basePrompt;

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

    if (mode === "institution") {
      if (institutionSubjectArea.trim()) {
        prompt += `${prompt ? " " : ""}Subject area: ${institutionSubjectArea.trim()}.`;
      }
      if (institutionSessionSetting.trim()) {
        prompt += ` Session setting: ${institutionSessionSetting.trim()}.`;
      }
      if (institutionTeachingFocus.trim()) {
        prompt += ` Teaching focus: ${institutionTeachingFocus.trim()}.`;
      }
      prompt +=
        " Address listeners as young learners or the class as a whole; do not use individual children's names.";
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

    if (mode === "institution") {
      const structuredAge = exactAge ?? ageFromBand(ageBand);
      const ageFromText = extracted?.age;
      if (structuredAge == null && ageFromText == null) {
        setErrorMessage(
          "Please set an age band in Story Preferences (or type an age such as “age 7” in your story idea) so content fits your group.",
        );
        return;
      }
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
      if (storyVideoUrl) {
        URL.revokeObjectURL(storyVideoUrl);
      }
      setStoryVideoUrl(null);
      setStoryVideoError("");

      const response = await generateStorySample(
        combinedPrompt,
        appState.accessToken,
        isTtsEnabled
      );

      const ttsAudioSrc =
        response.tts_audio_base64 && response.tts_media_type
          ? `data:${response.tts_media_type};base64,${response.tts_audio_base64}`
          : null;
      
      // If this is a refinement (story already exists), set as rewritten story
      if (generatedStory) {
        setRewrittenStory(response.output);
        setRewrittenStoryAudioSrc(ttsAudioSrc);
      } else {
        setGeneratedStory(response.output);
        setGeneratedStoryAudioSrc(ttsAudioSrc);
        setRewrittenStoryAudioSrc(null);
        const recTopic = deriveTopicFromStoryContext({
          interests,
          storyType,
          textPrompt: textPrompt.trim() || voiceTranscription?.trim() || "",
        });
        saveRecommendationActivity(recTopic, effectiveAge);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to generate story.";
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setTextPrompt("");
    setVoiceTranscription(null);
    setUploadedImages([]);
    setImageError("");
    setChildName("");
    setExactAge(null);
    setAgeBand(null);
    setInterests([]);
    setTone("");
    setLearningGoal("Just for fun");
    setStoryType("");
    setStoryLength("medium");
    setCurrentMood("");
    setLanguage("en");
    setInstitutionSubjectArea("");
    setInstitutionSessionSetting("");
    setInstitutionTeachingFocus("");
    setDetectedSummary("");
    setGeneratedStory("");
    setRewrittenStory("");
    setGeneratedStoryAudioSrc(null);
    setRewrittenStoryAudioSrc(null);
    setErrorMessage("");
    setFavoriteMessage("");
    setIsFavoriteSaved(false);
    lastImagePromptRef.current = "";
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

  const buildImagePromptSentence = (context: string) =>
    `Create a fun children's story inspired by ${context}.`;

  const upsertImageContext = (nextContext: string) => {
    const nextSentence = nextContext ? buildImagePromptSentence(nextContext) : "";

    setTextPrompt((prev) => {
      let next = prev.trimEnd();

      if (lastImagePromptRef.current && next.includes(lastImagePromptRef.current)) {
        next = next.replace(lastImagePromptRef.current, "").trimEnd();
      }

      if (nextSentence) {
        const separator = next ? "\n\n" : "";
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
      const message =
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try again.";
      setImageError(message);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleWatchStoryVideo = async () => {
    const storyText = (rewrittenStory || generatedStory).trim();
    if (storyText.length < 10) {
      setStoryVideoError("Story is too short to turn into a video.");
      return;
    }
    if (!appState.accessToken) {
      setStoryVideoError("You are not authenticated. Please sign in again.");
      return;
    }
    setStoryVideoError("");
    if (storyVideoUrl) {
      URL.revokeObjectURL(storyVideoUrl);
      setStoryVideoUrl(null);
    }
    try {
      setIsStoryVideoLoading(true);
      const audioSrc = rewrittenStory ? rewrittenStoryAudioSrc : generatedStoryAudioSrc;
      const tts = parseStoryTtsDataUrl(audioSrc);
      const blob = await generateStoryVideo(storyText, appState.accessToken, {
        includeVoice: includeStoryVideoVoice,
        imageProvider: storyVideoImageProvider,
        ttsAudioBase64: includeStoryVideoVoice ? tts?.ttsAudioBase64 : null,
        ttsMediaType: includeStoryVideoVoice ? tts?.ttsMediaType : null,
      });
      const url = URL.createObjectURL(blob);
      setStoryVideoUrl(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to generate story video.";
      setStoryVideoError(message);
    } finally {
      setIsStoryVideoLoading(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImageError("");
    setUploadedImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((image) => image.id !== id);
      upsertImageContext(buildImageContext(next));
      return next;
    });
  };

  const handleReplaceImage = async (id: string, file: File) => {
    setIsProcessingImages(true);
    setImageError("");
    try {
      const [replacement] = await processImageFiles([file]);
      setUploadedImages((prev) => {
        const next = prev.map((image) => {
          if (image.id !== id) return image;
          URL.revokeObjectURL(image.previewUrl);
          return replacement;
        });
        upsertImageContext(buildImageContext(next));
        return next;
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try again.";
      setImageError(message);
    } finally {
      setIsProcessingImages(false);
    }
  };

  return (
    <AppShellLayout>
      <Stack spacing={3}>
        <Box>
          <BackButton to={mode === "institution" ? "/institution" : "/home"} />
        </Box>
        {/* Main Input Component */}
        <UnifiedStoryInput
          mode={mode}
          institutionContext={
            mode === "institution"
              ? {
                  subjectArea: institutionSubjectArea,
                  setSubjectArea: setInstitutionSubjectArea,
                  sessionSetting: institutionSessionSetting,
                  setSessionSetting: setInstitutionSessionSetting,
                  teachingFocus: institutionTeachingFocus,
                  setTeachingFocus: setInstitutionTeachingFocus,
                }
              : undefined
          }
          childName={childName}
          setChildName={setChildName}
          textPrompt={textPrompt}
          setTextPrompt={setTextPrompt}
          voiceTranscription={voiceTranscription}
          setVoiceTranscription={handleVoiceTranscription}
          uploadedImages={uploadedImages}
          imageAnalysis={imageAnalysis}
          imageError={imageError}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          onReplaceImage={handleReplaceImage}
          isProcessingImages={isProcessingImages}
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
          onReset={handleReset}
          isTtsEnabled={isTtsEnabled}
          onToggleTts={() => setIsTtsEnabled((prev) => !prev)}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          hasExistingStory={!!generatedStory}
        />

        {/* Story Preview and Refinement */}
        {generatedStory && (
          <StoryPreviewPanel
            generatedStory={generatedStory}
            rewrittenStory={rewrittenStory}
            generatedStoryAudioSrc={generatedStoryAudioSrc}
            rewrittenStoryAudioSrc={rewrittenStoryAudioSrc}
            onSaveFavorite={handleSaveFavorite}
            isSavingFavorite={isSavingFavorite}
            isFavoriteSaved={isFavoriteSaved}
            favoriteMessage={favoriteMessage}
            errorMessage={errorMessage}
            onWatchStoryVideo={handleWatchStoryVideo}
            isStoryVideoLoading={isStoryVideoLoading}
            storyVideoUrl={storyVideoUrl}
            storyVideoError={storyVideoError}
            includeStoryVideoVoice={includeStoryVideoVoice}
            onToggleStoryVideoVoice={setIncludeStoryVideoVoice}
            storyVideoImageProvider={storyVideoImageProvider}
            onStoryVideoImageProviderChange={setStoryVideoImageProvider}
          />
        )}
      </Stack>
    </AppShellLayout>
  );
};

export default CreateStoryUnifiedPage;
