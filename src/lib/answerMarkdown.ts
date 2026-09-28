// Repairs the Markdown AI models emit before react-markdown renders it (spec F-02).
// HTML stays escaped, never parsed (no rehype-raw: that would open a raw-HTML surface for model
// output). A model's <br> becomes LINE_SEPARATOR instead, and rehypeLineBreaks renders that as a
// real <br> element.

/** U+2028 LINE SEPARATOR: not a Markdown line ending, so a table row that carries it stays one row. */
export const LINE_SEPARATOR = '\u2028';

const BR_TAG = /<br\s*\/?>/gi;
const FENCE = /^\s*(```|~~~)/;
const INLINE_CODE = /(`[^`\n]*`)/;
// A bold delimiter that is not part of *** (bold italic is left alone).
const BOLD = /(?<!\*)\*\*(?!\*)/g;
// CommonMark counts Unicode punctuation and symbols as punctuation when it decides flanking.
const PUNCT = /[\p{P}\p{S}]/u;
// Thai vowel and tone marks are \p{M}: they flank like the letter they sit on.
const WORD = /[\p{L}\p{N}\p{M}]/u;

/** <br> outside inline code becomes LINE_SEPARATOR. */
function replaceBreaks(line: string): string {
  return line
    .split(INLINE_CODE)
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(BR_TAG, LINE_SEPARATOR)))
    .join('');
}

/**
 * Thai puts no space between words, so in `**ขั้นตอน:**ทำ` the closing ** (after punctuation,
 * before a letter) is not right-flanking and never closes. Adds one space after such a closing
 * delimiter, and one space before an opening ** that follows a letter and precedes punctuation.
 * Delimiters pair up in order within the text given (one line, or one table cell), skipping
 * inline code spans entirely so a code span's own `**` never affects the count.
 */
function repairFlanking(text: string): string {
  const segments = text.split(INLINE_CODE);
  let count = 0;
  for (let i = 0; i < segments.length; i += 2) {
    const seg = segments[i];
    let out = '';
    let last = 0;
    for (const m of seg.matchAll(BOLD)) {
      const at = m.index;
      const before = seg[at - 1] ?? '';
      const after = seg[at + 2] ?? '';
      const opening = count % 2 === 0;
      count++;
      out += seg.slice(last, at);
      if (!opening && PUNCT.test(before) && WORD.test(after)) out += '** ';
      else if (opening && WORD.test(before) && PUNCT.test(after)) out += ' **';
      else out += '**';
      last = at + 2;
    }
    segments[i] = out + seg.slice(last);
  }
  return segments.join('');
}

/** A cell with an odd number of ** (outside inline code) loses its last one, so no stray ** shows as text. */
function balanceCell(cell: string): string {
  const segments = cell.split(INLINE_CODE);
  let count = 0;
  for (let i = 0; i < segments.length; i += 2) {
    count += [...segments[i].matchAll(BOLD)].length;
  }
  if (count % 2 === 0) return cell;
  for (let i = segments.length - 1; i >= 0; i -= 2) {
    const matches = [...segments[i].matchAll(BOLD)];
    if (matches.length === 0) continue;
    const at = matches[matches.length - 1].index;
    segments[i] = segments[i].slice(0, at) + segments[i].slice(at + 2);
    break;
  }
  return segments.join('');
}

/** Cells only: in a paragraph, bold may legitimately span lines. */
function repairTableRow(line: string): string {
  return line
    .split(/(?<!\\)\|/)
    .map((cell) => repairFlanking(balanceCell(cell)))
    .join('|');
}

export function normalizeAnswerMarkdown(md: string): string {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (FENCE.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      const withBreaks = replaceBreaks(line);
      return withBreaks.trimStart().startsWith('|') ? repairTableRow(withBreaks) : repairFlanking(withBreaks);
    })
    .join('\n');
}

// Minimal HAST shapes: enough for this walk, without importing `hast` types (not a direct dependency).
interface HastText { type: 'text'; value: string }
interface HastElement { type: 'element'; tagName: string; properties: Record<string, unknown>; children: HastNode[] }
interface HastParent { type: string; children?: HastNode[] }
type HastNode = HastText | HastElement | HastParent;

const isText = (node: HastNode): node is HastText => node.type === 'text';

function splitBreaks(parent: HastParent): void {
  if (!parent.children) return;
  parent.children = parent.children.flatMap((child): HastNode[] => {
    if (!isText(child)) {
      splitBreaks(child);
      return [child];
    }
    if (!child.value.includes(LINE_SEPARATOR)) return [child];
    return child.value.split(LINE_SEPARATOR).flatMap((value, i): HastNode[] => {
      const text: HastText[] = value ? [{ type: 'text', value }] : [];
      if (i === 0) return text;
      const br: HastElement = { type: 'element', tagName: 'br', properties: {}, children: [] };
      return [br, ...text];
    });
  });
}

/** Rehype plugin: each LINE_SEPARATOR in a text node becomes a <br> element. */
export function rehypeLineBreaks() {
  return (tree: HastParent) => splitBreaks(tree);
}
