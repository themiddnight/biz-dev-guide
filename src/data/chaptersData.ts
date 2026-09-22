import { Chapter } from '../types';
import { chapters1_5 } from './chapters/chapters1_5';
import { chapters6_10 } from './chapters/chapters6_10';
import { chapters11_15 } from './chapters/chapters11_15';
import { chapters16_19 } from './chapters/chapters16_19';
import { FRICTION_PLAYBOOKS } from './frictionPlaybooks';
import { CHAPTER_CONTENT } from './chapterContentBlocks';
import { CHAPTER_HERO_FIGURES } from './chapterHeroFigures';
import { CHAPTER_PERSPECTIVES } from './chapterPerspectives';

export const CHAPTERS: Chapter[] = [
  ...chapters1_5,
  ...chapters6_10,
  ...chapters11_15,
  ...chapters16_19
].map(chapter => {
  const frictionPlaybook = FRICTION_PLAYBOOKS[chapter.id];
  const contentSections = CHAPTER_CONTENT[chapter.id];
  return {
    ...chapter,
    frictionPlaybook: frictionPlaybook || undefined,
    contentSections: contentSections || undefined,
    heroFigure: CHAPTER_HERO_FIGURES[chapter.id],
    perspectives: CHAPTER_PERSPECTIVES[chapter.id]
  };
});
