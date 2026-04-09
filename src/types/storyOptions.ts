/**
 * Story Options Types for Privacy-First Story Creation
 * No personal data (names, birthdates) - only story preferences
 */

export interface StoryOptions {
  // Required for safety
  ageBand: number; // 1-12

  // Content preferences
  interests: string[];
  tone: string;
  learningGoal: string;
  storyType: string;
  storyLength: 'short' | 'medium' | 'long';

  // Optional preferences
  currentMood?: string;
  language?: string;

  // User inputs (not stored)
  textPrompt: string;
  voiceTranscription?: string;
  uploadedImages?: ImageAttachment[];
  imageAnalysis?: string;
}

export interface ImageAttachment {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  objects?: string[];
  activity?: string;
  scene?: string;
  mood?: string;
}

export const AGE_BANDS = [
  { value: 1, label: '1-2 years (Toddler)' },
  { value: 3, label: '3-4 years (Preschool)' },
  { value: 5, label: '5-6 years (Kindergarten)' },
  { value: 7, label: '7-8 years (Early Elementary)' },
  { value: 9, label: '9-10 years (Elementary)' },
  { value: 11, label: '11-12 years (Middle School)' },
] as const;

export const INTERESTS = [
  'Animals',
  'Space',
  'Friends',
  'Family',
  'Adventure',
  'Bedtime',
  'School',
  'Magic',
  'Ocean',
  'Dinosaurs',
  'Sports',
  'Music',
  'Art',
  'Nature',
  'Robots',
  'Mystery',
  'Fantasy',
  'Science',
  'Technology',
  'Cooking',
  'Travel',
  'Fairy Tales',
  'Superheroes',
  'Jungle',
  'History',
  'Celebrations',
  'Festivals',
  'Cartoon',
  'Vehicles',
  'Pets',
  'Cultures',
  'Inventions',
  'Seasons',
  'Comic',
] as const;

export const TONES = [
  'Calm',
  'Funny',
  'Brave',
  'Silly',
  'Gentle',
  'Exciting',
  'Soothing',
  'Playful',
  'Mysterious',
  'Inspiring',
] as const;

export const LEARNING_GOALS = [
  'Just for fun',
  'Confidence',
  'Sharing',
  'Kindness',
  'Handling feelings',
  'Numbers',
  'New words',
  'Problem-solving',
  'Teamwork',
  'Creativity',
  'Patience',
  'Bravery',
] as const;

export const STORY_TYPES = [
  'Adventure',
  'Everyday life',
  'School day',
  'Bedtime wind-down',
  'Magical journey',
  'Problem-solving',
  'Friendship story',
  'Family time',
  'Learning experience',
] as const;

export const MOODS = [
  'Excited',
  'Nervous',
  'Frustrated',
  'Calm',
  'Tired',
  'Energetic',
  'Curious',
  'Happy',
  'Worried',
  'Playful',
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English (Default)' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'hi', label: 'Hindi' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'bn', label: 'Bengali' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ur', label: 'Urdu' },
  { value: 'id', label: 'Indonesian' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'sw', label: 'Gujarati' },
  { value: 'mr', label: 'Marathi' },
  { value: 'te', label: 'Telugu' },
  { value: 'tr', label: 'Turkish' },
  { value: 'ta', label: 'Tamil' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ko', label: 'Korean' },
  { value: 'it', label: 'Italian' },
] as const;

export const STORY_LENGTHS = [
  { value: 'short', label: 'Short', duration: '2-3 min' },
  { value: 'medium', label: 'Medium', duration: '5 min' },
  { value: 'long', label: 'Long', duration: '8-10 min' },
] as const;

/** Institution / classroom story composer — used in prompts only (session-only, not stored). */
export const INSTITUTION_SUBJECT_AREAS = [
  'Literacy & language',
  'Science & nature',
  'Mathematics in context',
  'Social studies & community',
  'SEL & wellbeing',
  'Creative arts',
  'Health & movement',
  'Cross-curricular',
  'Other / not listed',
] as const;

export const INSTITUTION_SESSION_SETTINGS = [
  'Whole-class read-aloud',
  'Small group',
  'Circle time',
  'Library or story corner',
  'After-school / extended day',
  'Assembly or community',
] as const;
