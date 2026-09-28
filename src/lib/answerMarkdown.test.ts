import { describe, it, expect } from 'vitest';
import { LINE_SEPARATOR, normalizeAnswerMarkdown, rehypeLineBreaks } from './answerMarkdown';

describe('normalizeAnswerMarkdown (F-02)', () => {
  it.each(['<br>', '<BR/>', '<br />'])('turns %s in a table row into a line separator and keeps one row', (tag) => {
    const out = normalizeAnswerMarkdown(`| a | 1️⃣ ทำ${tag}2️⃣ ตรวจ |`);
    expect(out).toBe(`| a | 1️⃣ ทำ${LINE_SEPARATOR}2️⃣ ตรวจ |`);
    expect(out.split('\n')).toHaveLength(1);
  });

  it('leaves <br> inside inline code', () => {
    expect(normalizeAnswerMarkdown('ใช้ `<br>` ไม่ได้')).toBe('ใช้ `<br>` ไม่ได้');
  });

  it('adds a space after a closing ** that follows punctuation and precedes a letter', () => {
    expect(normalizeAnswerMarkdown('**ขั้นตอน:**ทำ')).toBe('**ขั้นตอน:** ทำ');
  });

  it('adds a space before an opening ** that follows a letter and precedes punctuation', () => {
    expect(normalizeAnswerMarkdown('ทำ**(ด่วน)**')).toBe('ทำ **(ด่วน)**');
  });

  it('counts a Thai tone mark as part of the letter it sits on', () => {
    expect(normalizeAnswerMarkdown('ที่**(ด่วน)**')).toBe('ที่ **(ด่วน)**');
  });

  it('leaves bold between two letters alone', () => {
    expect(normalizeAnswerMarkdown('คำ**หนา**คำ')).toBe('คำ**หนา**คำ');
  });

  it('drops the unmatched trailing ** of a table cell (s09)', () => {
    expect(normalizeAnswerMarkdown('| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น** | x |'))
      .toBe('| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น | x |');
  });

  it('keeps an escaped pipe inside a cell', () => {
    expect(normalizeAnswerMarkdown('| a \\| b** | c |')).toBe('| a \\| b | c |');
  });

  it('does not balance ** outside tables: bold may span the lines of a paragraph', () => {
    expect(normalizeAnswerMarkdown('**เริ่ม\nจบ**')).toBe('**เริ่ม\nจบ**');
  });

  it('leaves fenced code untouched', () => {
    const md = '```html\n<br>\n**ขั้นตอน:**ทำ\n| a** |\n```';
    expect(normalizeAnswerMarkdown(md)).toBe(md);
  });

  it('leaves *** bold italic alone', () => {
    expect(normalizeAnswerMarkdown('***ขั้นตอน:***ทำ')).toBe('***ขั้นตอน:***ทำ');
  });

  it('leaves a ** inside inline code in a table cell unchanged', () => {
    expect(normalizeAnswerMarkdown('| `2**10` | 1024 |')).toBe('| `2**10` | 1024 |');
  });

  it('leaves an odd number of ** inside a table-cell code span unchanged', () => {
    expect(normalizeAnswerMarkdown('| `**kwargs` | ... |')).toBe('| `**kwargs` | ... |');
  });

  it('does not let a ** inside inline code affect Thai flanking repair later in the paragraph', () => {
    expect(normalizeAnswerMarkdown('ใช้ `f(**kw)` แล้ว **ขั้นตอน:**ทำ'))
      .toBe('ใช้ `f(**kw)` แล้ว **ขั้นตอน:** ทำ');
  });
});

describe('rehypeLineBreaks', () => {
  it('splits text on the line separator into br elements', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'td', properties: {}, children: [{ type: 'text', value: `a${LINE_SEPARATOR}b${LINE_SEPARATOR}c` }] },
      ],
    };
    rehypeLineBreaks()(tree);
    const cell = tree.children[0].children.map((n: { type: string; tagName?: string; value?: string }) => n.tagName ?? n.value);
    expect(cell).toEqual(['a', 'br', 'b', 'br', 'c']);
  });

  it('drops the empty text a leading or trailing separator would leave', () => {
    const tree = { type: 'root', children: [{ type: 'text', value: `${LINE_SEPARATOR}x${LINE_SEPARATOR}` }] };
    rehypeLineBreaks()(tree);
    expect(tree.children.map((n: { tagName?: string; value?: string }) => n.tagName ?? n.value)).toEqual(['br', 'x', 'br']);
  });
});
