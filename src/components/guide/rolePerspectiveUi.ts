import type { LevelMode, Role } from '../../data/rolePerspective';

/**
 * Copy for the per-chapter level switch. The override is stored per role *and* per chapter,
 * and the reset falls back to whatever the header is offering — the row has to say both
 * (round3 spec P4.1, P4.2). Behaviour and storage are unchanged.
 */

// ROLE_META carries `origin`, `side` and `person`, none of which is the bare track name
// this chip needs (`ฝั่ง Business` / `Dev` read wrong after `เฉพาะสาย`).
const TRACK_NAME: Record<Role, string> = { biz: 'Business', eng: 'Engineering' };

/** `กลับไปใช้ค่าตามสายงาน` is only true while the header level mode is auto. */
export function chapterLevelResetLabel(levelMode: LevelMode): string {
  return levelMode === 'auto' ? 'กลับไปใช้ค่าตามสายงาน' : 'กลับไปใช้ระดับจากแถบบน';
}

/** Names the two things the override is scoped to: this chapter, and this role. */
export function chapterLevelScopeLabel(role: Role): string {
  return `เฉพาะบทนี้ · เฉพาะสาย ${TRACK_NAME[role]}`;
}
