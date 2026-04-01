const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

const resolveApiBaseUrl = (): string => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envBaseUrl?.trim() ? envBaseUrl.trim().replace(/\/$/, '') : DEFAULT_API_BASE_URL;
};

export interface BookRecommendation {
  title: string;
  author: string;
  cover: string | null;
  link: string;
  reason: string;
  score?: number | null;
}

/** Coalesce concurrent identical requests (e.g. React Strict Mode double-mount). */
const inflightByKey = new Map<string, Promise<BookRecommendation[]>>();

function requestKey(topic: string, age?: number): string {
  return `${topic.trim()}|${age ?? ''}`;
}

async function fetchBookRecommendationsUncached(
  topic: string,
  age?: number,
): Promise<BookRecommendation[]> {
  const apiBaseUrl = resolveApiBaseUrl();
  const params = new URLSearchParams({ topic });
  if (age !== undefined && !Number.isNaN(age)) {
    params.set('age', String(age));
  }

  console.log('Sending query:', topic);

  const response = await fetch(`${apiBaseUrl}/api/recommend-books?${params.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const detail = typeof errorPayload?.detail === 'string' ? errorPayload.detail : '';
    throw new Error(detail || 'Unable to load book recommendations.');
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data as BookRecommendation[];
}

export async function fetchBookRecommendations(
  topic: string,
  age?: number,
): Promise<BookRecommendation[]> {
  const key = requestKey(topic, age);
  const existing = inflightByKey.get(key);
  if (existing) {
    return existing;
  }

  const promise = fetchBookRecommendationsUncached(topic, age).finally(() => {
    inflightByKey.delete(key);
  });

  inflightByKey.set(key, promise);
  return promise;
}
