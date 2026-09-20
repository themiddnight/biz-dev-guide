import { Chapter } from '../types';
import { chapters1_5 } from './chapters/chapters1_5';
import { chapters6_10 } from './chapters/chapters6_10';
import { chapters11_15 } from './chapters/chapters11_15';
import { CHAPTER_ILLUSTRATIONS } from './chapterIllustrations';

export const CHAPTERS: Chapter[] = [
  ...chapters1_5,
  ...chapters6_10,
  ...chapters11_15
].map(chapter => {
  const illustration = CHAPTER_ILLUSTRATIONS[chapter.id];
  return {
    ...chapter,
    illustrations: illustration ? [illustration] : []
  };
});
