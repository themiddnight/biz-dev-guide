import type { Chapter, ExperienceLevel } from '../types';
import type { TrackKey } from './readingTracks';

export type Role = 'biz' | 'eng';
export type ChapterHome = Role | 'shared';
export type LevelMode = 'auto' | ExperienceLevel;

export const ROLES: readonly Role[] = ['biz', 'eng'];
export const otherRole = (r: Role): Role => (r === 'biz' ? 'eng' : 'biz');

/** Thai-first labels. `person` follows R8 (Dev for the person). */
export const ROLE_META: Record<Role, { origin: string; side: string; person: string; icon: string }> = {
  biz: { origin: 'ฉันมาจากสาย Business', side: 'ฝั่ง Business', person: 'Business', icon: '💼' },
  eng: { origin: 'ฉันมาจากสาย Engineering', side: 'ฝั่ง Engineering', person: 'Dev', icon: '💻' },
};

export interface LevelInputs {
  role: Role | null;
  baseLevel: ExperienceLevel; // existing be_guide_exp_level
  levelMode: LevelMode; // global override when role is set
  chapterLevels: Readonly<Record<string, ExperienceLevel>>; // per-chapter overrides
}

export type LevelSource = 'base' | 'chapter' | 'global' | 'role';

/**
 * First match wins: no role -> base level (today's behaviour); per-chapter override;
 * global level mode; otherwise the reader's own side opens experienced, the rest beginner (D3).
 */
export function resolveChapterLevel(
  i: LevelInputs,
  chapter: Pick<Chapter, 'id' | 'home'>,
): { level: ExperienceLevel; source: LevelSource } {
  if (i.role === null) return { level: i.baseLevel, source: 'base' };
  const override = i.chapterLevels[chapter.id];
  if (override) return { level: override, source: 'chapter' };
  if (i.levelMode !== 'auto') return { level: i.levelMode, source: 'global' };
  return { level: chapter.home === i.role ? 'experienced' : 'beginner', source: 'role' };
}

export const getActiveTrackKey = (role: Role | null, baseLevel: ExperienceLevel): TrackKey => role ?? baseLevel;
