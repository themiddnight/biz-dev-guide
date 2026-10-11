import { readStorage, writeStorage } from './storage';

const KEY = 'be_guide_checklist';

/** Ticked checklist lines, keyed `${chapterId}_cl_${index}`. Only ticked keys are stored. */
export type ChecklistState = Record<string, boolean>;

/** Parse at the boundary: anything that is not an array of strings reads as nothing ticked. */
export function parseChecklist(raw: string | null): ChecklistState {
  if (!raw) return {};
  try {
    const keys: unknown = JSON.parse(raw);
    if (!Array.isArray(keys)) return {};
    return Object.fromEntries(keys.filter((key): key is string => typeof key === 'string').map(key => [key, true]));
  } catch {
    return {};
  }
}

export const serializeChecklist = (state: ChecklistState): string =>
  JSON.stringify(Object.keys(state).filter(key => state[key]).sort());

export const loadChecklist = (): ChecklistState => parseChecklist(readStorage(KEY));
export const saveChecklist = (state: ChecklistState): void => writeStorage(KEY, serializeChecklist(state));
