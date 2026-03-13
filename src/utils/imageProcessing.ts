import { createPreviewUrl, validateImageFile } from "./imageApi";
import type { ImageAttachment } from "../types/storyOptions";

const UNSAFE_KEYWORDS = [
  "gun",
  "weapon",
  "knife",
  "blood",
  "gore",
  "violent",
  "violence",
  "adult",
  "nudity",
  "drug",
  "drugs",
  "alcohol",
  "cigarette",
  "smoke",
];

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `img_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const tokenizeFileName = (fileName: string): string[] => {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
};

const inferImageContext = (tokens: string[]) => {
  const objects = tokens.slice(0, 4);
  const activity =
    tokens.find((token) => token.endsWith("ing")) || "exploring";
  const scene = tokens.includes("park")
    ? "a park"
    : tokens.includes("beach")
    ? "a beach"
    : tokens.includes("school")
    ? "a school"
    : "a playful place";
  const mood = tokens.includes("happy") ? "happy" : "cheerful";

  return { objects, activity, scene, mood };
};

const buildCaption = (context: {
  objects: string[];
  activity: string;
  scene: string;
  mood: string;
}): string => {
  const objectText = context.objects.length
    ? context.objects.join(", ")
    : "colorful shapes";
  return `A ${context.mood} scene of ${objectText} ${context.activity} in ${context.scene}.`;
};

const checkImageSafety = async (file: File): Promise<{ safe: boolean }> => {
  const lowered = file.name.toLowerCase();
  const unsafe = UNSAFE_KEYWORDS.some((keyword) => lowered.includes(keyword));
  return { safe: !unsafe };
};

const analyzeImageFile = async (
  file: File
): Promise<{
  caption: string;
  objects: string[];
  activity: string;
  scene: string;
  mood: string;
}> => {
  const tokens = tokenizeFileName(file.name);
  const context = inferImageContext(tokens);
  const caption = buildCaption(context);

  // TODO: Replace with real vision model output when backend is ready.
  return { caption, ...context };
};

export const processImageFiles = async (
  files: File[]
): Promise<ImageAttachment[]> => {
  const attachments: ImageAttachment[] = [];

  for (const file of files) {
    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid image file.");
    }

    const safety = await checkImageSafety(file);
    if (!safety.safe) {
      throw new Error(
        "This image cannot be used for a children's story. Please upload another image."
      );
    }

    const analysis = await analyzeImageFile(file);
    attachments.push({
      id: generateId(),
      file,
      previewUrl: createPreviewUrl(file),
      caption: analysis.caption,
      objects: analysis.objects,
      activity: analysis.activity,
      scene: analysis.scene,
      mood: analysis.mood,
    });
  }

  return attachments;
};

export const buildImageContext = (images: ImageAttachment[]): string => {
  if (!images.length) return "";
  const parts = images.map((image) => image.caption.replace(/\.$/, ""));
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }
  return `${parts.slice(0, -1).join("; ")}, and ${parts[parts.length - 1]}`;
};
