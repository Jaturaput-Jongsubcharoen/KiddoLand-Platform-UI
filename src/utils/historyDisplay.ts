import type { StoryHistoryItem } from "./aiApi";

/** Data URL for <audio src> when the history record has stored TTS */
export function getHistoryAudioSrc(item: StoryHistoryItem): string | null {
  const b64 = item.tts_audio_base64?.trim();
  const mime = item.tts_media_type?.trim() || "audio/mpeg";
  if (!b64) return null;
  return `data:${mime};base64,${b64}`;
}

export type HistoryContentKindFilter = "all" | "story" | "rhyme";

/** Matches backend _effective_content_kind + handles legacy rows without content_kind. */
export function getContentKind(item: StoryHistoryItem): "story" | "rhyme" {
  if (item.content_kind === "rhyme") return "rhyme";
  if (item.content_kind === "story") return "story";
  const p = (item.prompt || "").toLowerCase();
  if (p.includes("this rhyme is for") || p.includes("write a short, playful rhyme")) {
    return "rhyme";
  }
  return "story";
}

/** Card / dialog title: stories use possessive; rhymes use "Name Rhymes". */
export function getHistoryCardTitle(item: StoryHistoryItem): string {
  const name = (item.child_name || "").trim() || "Child";
  return getContentKind(item) === "rhyme" ? `${name} Rhymes` : `${name}'s Story`;
}

export function matchesHistoryFilter(
  item: StoryHistoryItem,
  filter: HistoryContentKindFilter,
): boolean {
  if (filter === "all") return true;
  return getContentKind(item) === filter;
}
