const STORAGE_TOPIC = 'kiddoland_rec_topic';
const STORAGE_AGE = 'kiddoland_rec_age';

export const DEFAULT_REC_TOPIC = 'space';

export const RECS_UPDATED_EVENT = 'kiddoland-recs-updated';

const STOP_WORDS = new Set([
  'the',
  'for',
  'and',
  'with',
  'this',
  'that',
  'story',
  'about',
  'from',
  'into',
  'your',
  'have',
  'just',
  'fun',
  'are',
  'but',
  'not',
  'you',
  'was',
  'his',
  'her',
  'they',
]);

/**
 * Normalize only leading/trailing whitespace. Do not slice words, lowercase, or strip
 * punctuation — the full string must reach the recommendations API unchanged (except trim).
 */
export function sanitizeTopic(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) {
    return DEFAULT_REC_TOPIC;
  }
  return cleaned;
}

export function deriveTopicFromStoryContext(params: {
  interests: string[];
  storyType: string;
  textPrompt: string;
}): string {
  if (params.interests.length > 0) {
    return sanitizeTopic(params.interests[0]);
  }
  if (params.storyType.trim()) {
    return sanitizeTopic(params.storyType);
  }
  const words = params.textPrompt.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      return w;
    }
  }
  return DEFAULT_REC_TOPIC;
}

export function saveRecommendationActivity(
  topic: string,
  age: number | null,
  options?: { notify?: boolean },
): void {
  try {
    const t = sanitizeTopic(topic);
    localStorage.setItem(STORAGE_TOPIC, t);
    if (age !== null && age !== undefined && !Number.isNaN(age)) {
      localStorage.setItem(STORAGE_AGE, String(Math.min(18, Math.max(0, age))));
    }
    if (options?.notify !== false) {
      window.dispatchEvent(new Event(RECS_UPDATED_EVENT));
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadRecommendationActivity(): { topic: string; age: number | null } {
  try {
    const rawTopic = localStorage.getItem(STORAGE_TOPIC);
    const rawAge = localStorage.getItem(STORAGE_AGE);
    let age: number | null = null;
    if (rawAge) {
      const n = parseInt(rawAge, 10);
      if (!Number.isNaN(n) && n >= 0 && n <= 18) {
        age = n;
      }
    }
    const topic =
      rawTopic && rawTopic.trim() ? sanitizeTopic(rawTopic) : DEFAULT_REC_TOPIC;
    return { topic, age };
  } catch {
    return { topic: DEFAULT_REC_TOPIC, age: null };
  }
}

export function hasSavedRecommendationTopic(): boolean {
  try {
    const rawTopic = localStorage.getItem(STORAGE_TOPIC);
    return Boolean(rawTopic && rawTopic.trim());
  } catch {
    return false;
  }
}
