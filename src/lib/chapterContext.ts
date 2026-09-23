import type { Chapter } from '../types';

/** A guide chapter the AI answers from: `label` for the chip, `text` sent as the request context. */
export interface ChapterContext {
  label: string;
  text: string;
}

const CONTEXT_MAX = 1500;
const CONCEPT_MAX = 200;

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

// RichText markers are for the renderer; the model only needs the words.
const plain = (text: string) =>
  text
    .replace(/\[\[!g:[^\]]*\]\]/g, '')
    .replace(/\[\[(?:g:[a-z0-9-]+|s\d+)\|([^\]]+?)\]\]/g, '$1')
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The chapter's gist, most important first, so the length cap only ever drops the tail.
 * Kept short because every question resends it within Groq's free per-minute token budget.
 */
export function buildChapterContext(chapter: Chapter): ChapterContext {
  const label = `บทที่ ${chapter.num} · ${chapter.title}`;
  const lines = [
    `${label}${chapter.enTerm ? ` (${chapter.enTerm})` : ''}: ${chapter.subtitle}`,
    `ใจความสำคัญ: ${chapter.keyTakeaway}`,
    `เปรียบง่ายๆ: ${chapter.plainAnalogy}`,
    `ฝั่ง Business: ${chapter.businessNote}`,
    `ฝั่ง Engineer: ${chapter.engineerNote}`,
    ...(chapter.coreConcepts ?? []).map((c) => clip(`- ${c.heading}: ${plain(c.detail)}`, CONCEPT_MAX)),
    ...(chapter.checklist?.length ? [`เช็กลิสต์: ${chapter.checklist.join(' / ')}`] : []),
  ];
  return { label, text: clip(lines.map(plain).join('\n'), CONTEXT_MAX) };
}
