import type { BookRecommendation } from './recommendationsApi';

const STORAGE_KEY = 'kiddoland_rec_books_cache_v1';

type CacheStore = Record<string, { books: BookRecommendation[] }>;

function makeKey(topic: string, age: number | null | undefined): string {
  return `${topic.trim().toLowerCase()}|${age ?? ''}`;
}

function readStore(): CacheStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as CacheStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

/** `null` = no cache for this topic/age (show loading until network). */
export function getCachedRecommendations(
  topic: string,
  age: number | null | undefined,
): BookRecommendation[] | null {
  const entry = readStore()[makeKey(topic, age)];
  if (!entry || !Array.isArray(entry.books)) return null;
  return entry.books;
}

export function setCachedRecommendations(
  topic: string,
  age: number | null | undefined,
  books: BookRecommendation[],
): void {
  const store = readStore();
  store[makeKey(topic, age)] = { books };
  writeStore(store);
}
