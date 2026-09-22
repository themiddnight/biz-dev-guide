import type { Chapter, ExperienceLevel } from '../types';
import type { Role } from './rolePerspective';

export type TrackKey = ExperienceLevel | Role;

export const TRACK_CHAPTER_NUMS: Record<TrackKey, readonly number[]> = {
  beginner: [1, 2, 3, 4, 6, 7, 11, 14],
  experienced: [11, 1, 6, 9, 12, 13, 14],
  biz: [1, 4, 5, 6, 9, 10, 11, 13], // 98 min: how software gets built, broken and fixed
  eng: [1, 2, 3, 4, 12, 11, 14, 9], // 92 min: business-side chapters first
};

export const TRACK_META: Record<TrackKey, { title: string; description: string }> = {
  beginner: { title: 'เส้นทางมือใหม่', description: 'ไล่ตั้งแต่ต้นน้ำถึงการทดสอบ แล้วปิดด้วยความขัดแย้งที่เจอบ่อย' },
  experienced: { title: 'เส้นทางคนทำงานข้ามทีม', description: 'เริ่มจากความขัดแย้งจริง แล้วลงลึกเรื่องด่านตรวจงาน หนี้เทคนิค และยุค AI' },
  biz: { title: 'เส้นทางคนสาย Business', description: 'เข้าใจว่าทีม Engineering ทำงานยังไง ตั้งแต่สเปกถึงวันที่ระบบล่ม' },
  eng: { title: 'เส้นทางคนสาย Engineering', description: 'เริ่มจากฝั่ง Business: ใครตัดสินใจ ทำไมต้องรีบ แล้วค่อยคุยเรื่องหนี้เทคนิค' },
};

export type ChapterRef = Pick<Chapter, 'id' | 'num' | 'readTime'>;

export function resolveTrack(key: TrackKey, chapters: ChapterRef[]): string[] {
  return TRACK_CHAPTER_NUMS[key]
    .map(num => chapters.find(c => c.num === num)?.id)
    .filter((id): id is string => id !== undefined);
}

export function parseReadMinutes(readTime: string): number {
  const match = /\d+/.exec(readTime);
  return match ? Number(match[0]) : 0;
}

export function getTrackMinutes(trackIds: string[], chapters: ChapterRef[]): number {
  return trackIds.reduce((sum, id) => {
    const chapter = chapters.find(c => c.id === id);
    return sum + (chapter ? parseReadMinutes(chapter.readTime) : 0);
  }, 0);
}

export type TrackNext = { kind: 'next'; chapterId: string } | { kind: 'end' } | { kind: 'not-in-track' };

export function getTrackNext(trackIds: string[], chapterId: string): TrackNext {
  const index = trackIds.indexOf(chapterId);
  if (index === -1) return { kind: 'not-in-track' };
  if (index === trackIds.length - 1) return { kind: 'end' };
  return { kind: 'next', chapterId: trackIds[index + 1] };
}

export function getTrackProgress(
  trackIds: string[],
  readChapters: string[],
): { read: number; total: number; firstUnreadId: string | null } {
  return {
    read: trackIds.filter(id => readChapters.includes(id)).length,
    total: trackIds.length,
    firstUnreadId: trackIds.find(id => !readChapters.includes(id)) ?? null,
  };
}
