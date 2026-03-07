interface AiSampleResponse {
  output: string;
}

interface RhymeGenerateResponse {
  story: string;
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
  created_at: string | null;
  updated_at: string | null;
}

interface StoryHistoryResponse {
  items: StoryHistoryItem[];
}

interface StoryRewriteResponse {
  story: string;
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
  accessToken: string
): Promise<AiSampleResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/ai/sample`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt }),
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
  accessToken: string
): Promise<RhymeGenerateResponse> => {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/story/generate-rhyme`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt, age }),
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
  accessToken: string
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
  type: 'generate' | 'rewrite' = 'generate'
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
