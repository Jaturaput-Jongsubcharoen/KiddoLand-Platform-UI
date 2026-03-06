import {
  INTERESTS,
  TONES,
  LEARNING_GOALS,
  STORY_TYPES,
  MOODS,
  LANGUAGES,
} from "../types/storyOptions";

export type StoryLength = "short" | "medium" | "long";

export interface ExtractedStoryInfo {
  cleanedText: string;
  childName?: string;
  age?: number;
  ageBand?: number;
  interests: string[];
  tone?: string;
  learningGoal?: string;
  storyType?: string;
  storyLength?: StoryLength;
  currentMood?: string;
  language?: string;
}

const WORD_NUMBER_MAP: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const DISALLOWED_NAME_TOKENS = new Set([
  "a",
  "an",
  "the",
  "my",
  "our",
  "your",
  "their",
  "kid",
  "kids",
  "child",
  "children",
  "son",
  "daughter",
  "boy",
  "girl",
  "student",
  "students",
  "class",
  "classroom",
  "group",
  "story",
  "age",
  "years",
  "year",
  "old",
]);

const LANGUAGE_ALIASES: Record<string, string[]> = {
  zh: ["chinese", "mandarin"],
  pt: ["portuguese", "brazilian portuguese"],
  es: ["spanish"],
  fr: ["french"],
  ar: ["arabic"],
  hi: ["hindi"],
  bn: ["bengali"],
  ru: ["russian"],
  ur: ["urdu"],
  id: ["indonesian"],
  de: ["german"],
  ja: ["japanese"],
  sw: ["swahili"],
  mr: ["marathi"],
  te: ["telugu"],
  tr: ["turkish"],
  ta: ["tamil"],
  vi: ["vietnamese"],
  ko: ["korean"],
  it: ["italian"],
  en: ["english"],
};

const LENGTH_SYNONYMS: Record<StoryLength, string[]> = {
  short: ["short", "brief", "quick", "tiny"],
  medium: ["medium", "average", "normal", "standard"],
  long: ["long", "longer", "detailed", "extended"],
};

const AGE_BAND_LOOKUP: Record<number, number> = {
  1: 2,
  3: 4,
  5: 6,
  7: 8,
  9: 10,
  11: 10,
};

export const cleanTranscript = (text: string): string => {
  if (!text) return "";

  let cleaned = text.replace(/[\x00-\x1F\x7F]/g, " ");
  cleaned = cleaned.replace(/\b(um|uh|er|ah|like|you know|kind of|sort of)\b/gi, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
};

const normalizeText = (text: string): string => cleanTranscript(text).toLowerCase();

const buildPhrasePattern = (phrase: string): RegExp => {
  const escaped = phrase
    .trim()
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${escaped}\\b`, "i");
};

const findMatches = (text: string, options: readonly string[]): string[] => {
  return options.filter((option) => buildPhrasePattern(option).test(text));
};

const findFirstMatch = (text: string, options: readonly string[]): string | undefined => {
  return options.find((option) => buildPhrasePattern(option).test(text));
};

const extractAgeFromText = (text: string): number | undefined => {
  const cleaned = normalizeText(text);
  if (!cleaned) return undefined;

  const rangePattern =
    /\b(\d{1,2})\s*-\s*(\d{1,2})\s*(?:years?\s*old|year\s*old|y\/o|yo)\b/i;
  const rangeMatch = cleaned.match(rangePattern);
  if (rangeMatch) {
    const age = Number(rangeMatch[1]);
    if (!Number.isNaN(age)) return age;
  }

  const digitPatterns = [
    /\b(\d{1,2})\s*[- ]\s*year\s*[- ]\s*old\b/i,
    /\b(\d{1,2})\s*(?:years?\s*old|year\s*old|yr\s*old|y\/o|yo)\b/i,
    /\baged\s*(\d{1,2})\b/i,
    /\bage\s*(\d{1,2})\b/i,
    /\bfor\s+(\d{1,2})\s*(?:years?\s*old|year\s*old)?\b/i,
  ];

  for (const pattern of digitPatterns) {
    const match = cleaned.match(pattern);
    if (!match) continue;
    const age = Number(match[1]);
    if (!Number.isNaN(age)) return age;
  }

  const wordPattern =
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b(?:\s*(?:years?\s*old|year\s*old|yr\s*old|y\/o|yo))?/i;
  const wordMatch = cleaned.match(wordPattern);
  if (wordMatch) {
    const mapped = WORD_NUMBER_MAP[wordMatch[1].toLowerCase()];
    if (mapped) return mapped;
  }

  return undefined;
};

const toAgeBand = (age: number): number | undefined => {
  if (age <= 2) return 1;
  if (age <= 4) return 3;
  if (age <= 6) return 5;
  if (age <= 8) return 7;
  if (age <= 10) return 9;
  if (age <= 12) return 11;
  return undefined;
};

const extractChildName = (text: string): string | undefined => {
  const cleaned = cleanTranscript(text);
  if (!cleaned) return undefined;

  const patterns = [
    /\bnamed\s+([A-Za-z][A-Za-z'\-]{1,30})\b/i,
    /\bcalled\s+([A-Za-z][A-Za-z'\-]{1,30})\b/i,
    /\bname\s+is\s+([A-Za-z][A-Za-z'\-]{1,30})\b/i,
    /\b(?:son|daughter|kid|child)\s+named\s+([A-Za-z][A-Za-z'\-]{1,30})\b/i,
    /\b(?:son|daughter|kid|child)\s+([A-Za-z][A-Za-z'\-]{1,30})\b/i,
    /\bfor\s+([A-Za-z][A-Za-z'\-]{1,30})\b/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (!match) continue;
    const candidate = match[1].trim().replace(/^[-']|[-']$/g, "");
    if (candidate.length < 2) continue;
    if (DISALLOWED_NAME_TOKENS.has(candidate.toLowerCase())) continue;
    return candidate[0].toUpperCase() + candidate.slice(1);
  }

  return undefined;
};

const matchLanguage = (text: string): string | undefined => {
  const cleaned = normalizeText(text);
  if (!cleaned) return undefined;

  for (const [value, aliases] of Object.entries(LANGUAGE_ALIASES)) {
    for (const alias of aliases) {
      const pattern = buildPhrasePattern(alias);
      if (pattern.test(cleaned)) {
        return value;
      }
    }
  }

  for (const entry of LANGUAGES) {
    const label = entry.label.replace(/\s*\(.*\)$/, "").toLowerCase();
    if (buildPhrasePattern(label).test(cleaned)) {
      return entry.value;
    }
  }

  return undefined;
};

const matchStoryLength = (text: string): StoryLength | undefined => {
  for (const [length, synonyms] of Object.entries(LENGTH_SYNONYMS) as [
    StoryLength,
    string[]
  ][]) {
    if (synonyms.some((word) => buildPhrasePattern(word).test(text))) {
      return length;
    }
  }
  return undefined;
};

export const extractStoryInfo = (
  text: string,
  mode: "home" | "institution" | null
): ExtractedStoryInfo => {
  const cleanedText = cleanTranscript(text);
  const normalized = normalizeText(text);
  const age = extractAgeFromText(text);
  const ageBand = age ? toAgeBand(age) : undefined;

  const interests = findMatches(normalized, INTERESTS);
  const tone = findFirstMatch(normalized, TONES);
  const learningGoal = findFirstMatch(normalized, LEARNING_GOALS);
  const storyType = findFirstMatch(normalized, STORY_TYPES);
  const currentMood = findFirstMatch(normalized, MOODS);
  const storyLength = matchStoryLength(normalized);
  const language = matchLanguage(normalized);

  return {
    cleanedText,
    childName: mode === "home" ? extractChildName(text) : undefined,
    age,
    ageBand,
    interests,
    tone,
    learningGoal,
    storyType,
    currentMood,
    storyLength,
    language,
  };
};

export const buildDetectedSummary = (
  info: ExtractedStoryInfo,
  mode: "home" | "institution" | null
): string => {
  const parts: string[] = [];

  if (mode === "home" && info.childName) {
    parts.push(`name: ${info.childName}`);
  }
  if (info.age) {
    parts.push(`age: ${info.age}`);
  }
  if (info.storyLength) {
    parts.push(`length: ${info.storyLength}`);
  }
  if (info.tone) {
    parts.push(`tone: ${info.tone}`);
  }
  if (info.currentMood) {
    parts.push(`mood: ${info.currentMood}`);
  }
  if (info.storyType) {
    parts.push(`type: ${info.storyType}`);
  }
  if (info.learningGoal) {
    parts.push(`goal: ${info.learningGoal}`);
  }
  if (info.interests.length > 0) {
    parts.push(`themes: ${info.interests.join(", ")}`);
  }
  if (info.language && info.language !== "en") {
    const label = getLanguageLabel(info.language);
    parts.push(`language: ${label}`);
  }

  return parts.join(" | ");
};

export const ageFromBand = (ageBand: number | null): number | null => {
  if (!ageBand) return null;
  return AGE_BAND_LOOKUP[ageBand] ?? null;
};

export const getLanguageLabel = (value: string): string => {
  const entry = LANGUAGES.find((lang) => lang.value === value);
  if (!entry) return value;
  return entry.label.replace(/\s*\(.*\)$/, "");
};
