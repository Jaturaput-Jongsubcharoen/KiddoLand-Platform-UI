// ── Types ─────────────────────────────────────────────────────────────────────
export type RhymeStyle = "nursery" | "counting" | "finger_play" | "simple_poem";
export type RhymeLength = "short" | "medium" | "long";
export type RhymePattern = "aabb" | "abab" | "repetitive" | "free";

// ── Rhyme styles ──────────────────────────────────────────────────────────────
export const RHYME_STYLES: { value: RhymeStyle; label: string }[] = [
  { value: "nursery", label: "Nursery rhyme" },
  { value: "counting", label: "Counting rhyme" },
  { value: "finger_play", label: "Finger-play / chorus" },
  { value: "simple_poem", label: "Simple poem" },
];

// ── Rhyme patterns ────────────────────────────────────────────────────────────
export const RHYME_PATTERNS: { value: RhymePattern; label: string; hint: string }[] = [
  { value: "aabb", label: "AABB", hint: "Lines 1+2 rhyme, lines 3+4 rhyme" },
  { value: "abab", label: "ABAB", hint: "Alternating lines rhyme" },
  { value: "repetitive", label: "Repetitive", hint: "A key phrase repeats each verse" },
  { value: "free", label: "Free rhyme", hint: "Natural rhythm, no strict scheme" },
];

// ── Rhyme purposes (what the rhyme is for) ────────────────────────────────────
export const RHYME_PURPOSES: { value: string; label: string; instruction: string }[] = [
  {
    value: "bedtime",
    label: "Bedtime",
    instruction: "Make it a soothing bedtime rhyme that helps the child wind down and feel sleepy.",
  },
  {
    value: "educational",
    label: "Educational",
    instruction: "Make it an educational rhyme that teaches something valuable in a fun way.",
  },
  {
    value: "action",
    label: "Action / Movement",
    instruction: "Make it an action rhyme with movements or gestures the child can act out.",
  },
  {
    value: "lullaby",
    label: "Lullaby",
    instruction: "Make it a gentle lullaby with a slow, soothing rhythm.",
  },
  {
    value: "silly",
    label: "Silly & Fun",
    instruction: "Make it a silly, funny rhyme full of giggles and playful nonsense.",
  },
  {
    value: "celebration",
    label: "Celebration",
    instruction: "Make it a joyful, celebratory rhyme for a special occasion.",
  },
  {
    value: "morning",
    label: "Morning routine",
    instruction: "Make it an upbeat morning rhyme about waking up, brushing teeth, and starting the day.",
  },
  {
    value: "problem_solving",
    label: "Problem-solving",
    instruction: "Use the rhyme to model a simple problem and show how the child works through it.",
  },
];

// ── Learning focuses (what the rhyme teaches) ─────────────────────────────────
export const LEARNING_FOCUSES: { value: string; label: string; instruction: string }[] = [
  {
    value: "alphabet",
    label: "Alphabet (A–Z)",
    instruction: "Weave in words that highlight different letters of the alphabet (A–Z).",
  },
  {
    value: "numbers",
    label: "Numbers",
    instruction: "Include counting and numbers naturally throughout the rhyme.",
  },
  {
    value: "colors",
    label: "Colors",
    instruction: "Name and celebrate different colors in a fun, descriptive way.",
  },
  {
    value: "animals",
    label: "Animals",
    instruction: "Feature different animals, their sounds, or their traits.",
  },
  {
    value: "shapes",
    label: "Shapes",
    instruction: "Include names and descriptions of basic shapes (circle, square, triangle, etc.).",
  },
  {
    value: "phonics",
    label: "Phonics (sounds)",
    instruction:
      "Focus on a specific letter sound or phonics pattern; repeat words that share that sound.",
  },
  {
    value: "emotions",
    label: "Emotions",
    instruction: "Help the child name and explore different feelings in a safe, comforting way.",
  },
  {
    value: "rhyming_words",
    label: "Rhyming words",
    instruction:
      "Emphasise pairs of rhyming words so the child practises recognising rhymes.",
  },
  {
    value: "body_parts",
    label: "Body parts",
    instruction: "Name and describe parts of the body in a playful, interactive way.",
  },
  {
    value: "days_week",
    label: "Days of the week",
    instruction: "Teach the seven days of the week in a catchy, memorable sequence.",
  },
  {
    value: "seasons",
    label: "Seasons",
    instruction: "Introduce the four seasons and what happens in each.",
  },
  {
    value: "opposites",
    label: "Opposites",
    instruction:
      "Teach opposite word pairs like big/small, hot/cold, fast/slow.",
  },
  {
    value: "nature",
    label: "Nature & Science",
    instruction: "Introduce plants, weather, animals, or simple science concepts.",
  },
  {
    value: "manners",
    label: "Manners",
    instruction: "Teach polite words and good manners (please, thank you, sharing) in a fun way.",
  },
];

// ── Internal instruction maps ─────────────────────────────────────────────────
const STYLE_INSTRUCTIONS: Record<RhymeStyle, string> = {
  nursery: "Use a classic nursery-rhyme feel with clear rhyming line pairs and a gentle rhythm.",
  counting: "Use a counting-rhyme style with numbers, repetition, and a steady beat.",
  finger_play: "Use very short lines and a simple repeating chorus the child can join in on.",
  simple_poem: "Use a short rhyming poem with a clear, simple rhythm.",
};

const PATTERN_INSTRUCTIONS: Record<RhymePattern, string> = {
  aabb:
    "Follow an AABB rhyme scheme — lines 1 and 2 rhyme, lines 3 and 4 rhyme.",
  abab:
    "Follow an ABAB rhyme scheme — lines 1 and 3 rhyme, lines 2 and 4 rhyme (alternating).",
  repetitive:
    "Use a repetitive structure where a key phrase or chorus line is repeated in each verse.",
  free: "Use a free, natural rhyme pattern — focus on rhythm and flow rather than a strict scheme.",
};

const LENGTH_INSTRUCTIONS: Record<RhymeLength, string> = {
  short: "Keep it brief: about 4–6 short lines total.",
  medium: "Use about 8–12 lines or two short stanzas.",
  long: "Use about 14–20 lines with clear verse breaks, easy to follow aloud.",
};

// ── Prompt builder ────────────────────────────────────────────────────────────
export interface BuildRhymePromptParams {
  childName: string;
  age: number;
  topic: string;
  style: RhymeStyle;
  pattern: RhymePattern;
  length: RhymeLength;
  tone: string;
  /** Raw `instruction` string from RHYME_PURPOSES (empty = no preference). */
  purposeInstruction: string;
  /** Raw `instruction` string from LEARNING_FOCUSES (empty = none). */
  learningInstruction: string;
}

/**
 * Builds a single prompt string for POST /story/generate-rhyme.
 * Always keeps "for {Name}, age {n}" so backend name + age extraction succeeds.
 * Request body may also include `include_tts: boolean` (optional); when true, the API
 * returns `tts_audio_base64` and `tts_media_type` like the story flow.
 */
export function buildRhymePrompt(params: BuildRhymePromptParams): string {
  const {
    childName,
    age,
    topic,
    style,
    pattern,
    length,
    tone,
    purposeInstruction,
    learningInstruction,
  } = params;

  const cleanName = childName.trim();
  const cleanTopic = topic.trim();

  const about = cleanTopic
    ? `Write a short, playful rhyme about ${cleanTopic}.`
    : "Write a short, playful rhyme about something fun and kind.";

  const parts: string[] = [
    `${about} This rhyme is for ${cleanName}, age ${age}. Keep it positive and age-appropriate.`,
  ];

  if (purposeInstruction.trim()) {
    parts.push(purposeInstruction.trim());
  }

  parts.push(STYLE_INSTRUCTIONS[style]);
  parts.push(PATTERN_INSTRUCTIONS[pattern]);
  parts.push(LENGTH_INSTRUCTIONS[length]);

  if (tone.trim()) {
    parts.push(`Make the overall tone ${tone.trim().toLowerCase()}.`);
  }

  if (learningInstruction.trim()) {
    parts.push(`Learning focus: ${learningInstruction.trim()}`);
  }

  parts.push(
    "Use vocabulary and sentence complexity appropriate for the child's age. End on a warm, positive note.",
  );

  return parts.join(" ");
}
