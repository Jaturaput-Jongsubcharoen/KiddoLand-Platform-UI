interface AiSampleResponse {
  output: string;
  tts_audio_base64?: string | null;
  tts_media_type?: string | null;
}

export interface RhymeGenerateResponse {
  story: string;
  tts_audio_base64?: string | null;
  tts_media_type?: string | null;
}

export interface StoryHistoryItem {
  id: string;
  user_id: string;
  child_name: string;
  prompt: string;
  story: string;
  age: number | null;
  is_favorite: boolean;
  mode: string;
  type: 'generate' | 'rewrite';
  /** From API: story vs rhyme creation; omitted in older records → treat as story */
  content_kind?: 'story' | 'rhyme';
  created_at: string | null;
  updated_at: string | null;
  /** Set when TTS was generated and stored with this record */
  tts_audio_base64?: string | null;
  tts_media_type?: string | null;
}

interface StoryHistoryResponse {
  items: StoryHistoryItem[];
}

interface StoryRewriteResponse {
  story: string;
  tts_audio_base64?: string | null;
  tts_media_type?: string | null;
}

interface SaveFavoriteResponse {
  saved: boolean;
  message: string;
}

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

const resolveApiBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envBaseUrl?.trim() ? envBaseUrl.trim().replace(/\/$/, '') : DEFAULT_API_BASE_URL;
};

export const generateStorySample = async (
  prompt: string,
  accessToken: string,
  includeTts = true
): Promise<AiSampleResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/sample`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt, include_tts: includeTts }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 400) {
      throw new Error(
        backendMessage ||
          'Please include a child name and age (1-10) in your prompt, for example: "for Emma, age 7".'
      );
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status >= 500) {
      throw new Error('Server is unavailable right now. Please try again shortly.');
    }

    throw new Error(backendMessage || 'Unable to generate a story right now.');
  }

  return response.json();
};

export const generateRhyme = async (
  prompt: string,
  age: number,
  accessToken: string,
  includeTts = false,
): Promise<RhymeGenerateResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/story/generate-rhyme`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt, age, include_tts: includeTts }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 400) {
      throw new Error(
        backendMessage ||
          'Please include a child name and an age between 1 and 10.'
      );
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status >= 500) {
      throw new Error('Server is unavailable right now. Please try again shortly.');
    }

    throw new Error(backendMessage || 'Unable to generate a rhyme right now.');
  }

  return response.json();
};

export interface LearningActivityQuestion {
  prompt: string;
  options: string[];
  correct_index: number;
  feedback_correct: string;
  feedback_incorrect: string;
}

export interface LearningActivityData {
  title: string;
  questions: LearningActivityQuestion[];
}

export type LearningActivityApiResult =
  | { success: true; data: LearningActivityData }
  | { success: false; error: string };

export const generateLearningActivity = async (
  params: {
    age_band: string;
    theme: string;
    learning_goal: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  },
  accessToken: string,
): Promise<LearningActivityApiResult> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const body: Record<string, unknown> = {
    age_band: params.age_band.trim(),
    theme: params.theme.trim(),
    learning_goal: params.learning_goal.trim(),
  };
  if (params.difficulty) {
    body.difficulty = params.difficulty;
  }

  const response = await fetch(`${apiBaseUrl}/ai/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let errorPayload: Record<string, unknown> = {};
  if (rawText) {
    try {
      errorPayload = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      errorPayload = {};
    }
  }

  if (response.status === 401) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (response.status === 400) {
    const backendMessage =
      typeof errorPayload.detail === 'string' ? errorPayload.detail : '';
    throw new Error(backendMessage || 'Invalid activity request.');
  }

  if (response.status === 422) {
    const detail = errorPayload.detail;
    const msg =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join(' ')
          : '';
    throw new Error(msg || 'Please check age band, theme, and learning goal.');
  }

  if (!response.ok) {
    const backendMessage =
      typeof errorPayload.detail === 'string' ? errorPayload.detail : '';
    throw new Error(backendMessage || 'Unable to generate learning activity.');
  }

  if (errorPayload.success === false) {
    return {
      success: false,
      error:
        typeof errorPayload.error === 'string'
          ? errorPayload.error
          : 'Failed to generate activity',
    };
  }

  if (
    errorPayload.success === true &&
    errorPayload.data &&
    typeof errorPayload.data === 'object'
  ) {
    return {
      success: true,
      data: errorPayload.data as LearningActivityData,
    };
  }

  throw new Error('Unexpected response from learning activity service.');
};

export const getStoryHistory = async (accessToken: string): Promise<StoryHistoryItem[]> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw new Error('Unable to load story history right now.');
  }

  const payload: StoryHistoryResponse = await response.json();
  return payload.items;
};

export const rewriteStory = async (
  originalStory: string,
  instruction: string,
  age: number,
  accessToken: string,
  includeTts = true,
): Promise<StoryRewriteResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/story/rewrite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      age,
      original_story: originalStory,
      instruction,
      include_tts: includeTts,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 400) {
      throw new Error(backendMessage || 'Please check your rewrite instruction and try again.');
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status >= 500) {
      throw new Error('Server is unavailable right now. Please try again shortly.');
    }

    throw new Error(backendMessage || 'Unable to rewrite story right now.');
  }

  return response.json();
};

export const saveFavoriteStory = async (
  prompt: string,
  story: string,
  age: number,
  accessToken: string,
  type: 'generate' | 'rewrite' = 'generate',
  contentKind: 'story' | 'rhyme' = 'story',
): Promise<SaveFavoriteResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/save-favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      prompt,
      story,
      age,
      type,
      content_kind: contentKind,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 400) {
      throw new Error(backendMessage || 'Unable to save favorite. Please check your story details.');
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status >= 500) {
      throw new Error('Server is unavailable right now. Please try again shortly.');
    }

    throw new Error(backendMessage || 'Unable to save favorite right now.');
  }

  return response.json();
};

export const getFavoriteStories = async (accessToken: string): Promise<StoryHistoryItem[]> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/favorites`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw new Error('Unable to load favorite stories right now.');
  }

  return await response.json();
};

export type StoryVideoImageProvider = 'gemini' | 'huggingface';

/** Parse data: URL from story TTS playback (tts_audio_base64 + tts_media_type). */
export function parseStoryTtsDataUrl(
  dataUrl: string | null | undefined
): { ttsAudioBase64: string; ttsMediaType: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const meta = dataUrl.slice(5, comma);
  const [mimePart] = meta.split(';');
  const mime = mimePart?.trim() || 'audio/mpeg';
  if (!meta.toLowerCase().includes('base64')) return null;
  const b64 = dataUrl.slice(comma + 1).replace(/\s/g, '');
  if (!b64) return null;
  return { ttsAudioBase64: b64, ttsMediaType: mime };
}

export const generateStoryVideo = async (
  story: string,
  accessToken: string,
  options?: {
    includeVoice?: boolean;
    imageProvider?: StoryVideoImageProvider;
    ttsAudioBase64?: string | null;
    ttsMediaType?: string | null;
  }
): Promise<Blob> => {
  const includeVoice = options?.includeVoice ?? true;
  const imageProvider = options?.imageProvider ?? 'gemini';
  const apiBaseUrl = resolveApiBaseUrl();
  const body: Record<string, unknown> = {
    story,
    include_voice: includeVoice,
    image_provider: imageProvider,
  };
  if (includeVoice && options?.ttsAudioBase64) {
    body.tts_audio_base64 = options.ttsAudioBase64;
    body.tts_media_type = options.ttsMediaType ?? 'audio/mpeg';
  }
  const response = await fetch(`${apiBaseUrl}/generate-video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage =
      typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 400) {
      throw new Error(backendMessage || 'Cannot create video from this story.');
    }

    if (response.status === 422) {
      throw new Error('Story text is too short or invalid for video (minimum 10 characters).');
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status === 429) {
      throw new Error(
        backendMessage || 'Video service is rate-limited. Please try again in a few minutes.'
      );
    }

    if (response.status >= 500) {
      throw new Error(
        backendMessage || 'Video generation failed on the server. Please try again later.'
      );
    }

    throw new Error(backendMessage || 'Unable to generate story video right now.');
  }

  return response.blob();
};

export const deleteStory = async (storyId: string, accessToken: string): Promise<{ success: boolean; message: string }> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/history/${storyId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status === 404) {
      throw new Error('Story not found or already deleted.');
    }

    if (response.status >= 500) {
      throw new Error('Server is unavailable right now. Please try again shortly.');
    }

    throw new Error(backendMessage || 'Unable to delete story right now.');
  }

  return response.json();
};

export const toggleFavorite = async (
  storyId: string,
  accessToken: string
): Promise<{ success: boolean; is_favorite: boolean; message: string }> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/history/${storyId}/favorite`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const backendMessage = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status === 404) {
      throw new Error('Story not found.');
    }

    if (response.status >= 500) {
      throw new Error('Server is unavailable right now. Please try again shortly.');
    }

    throw new Error(backendMessage || 'Unable to update favorite status right now.');
  }

  return response.json();
};
