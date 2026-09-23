import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AIAssistantTab } from './AIAssistantTab';

describe('AIAssistantTab hierarchy (spec §10.1, §10.3, §10.5)', () => {
  const html = renderToStaticMarkup(<AIAssistantTab onQuestionAsked={() => {}} />);
  const send = html.match(/<button[^>]*type="submit"[^>]*>/)?.[0] ?? '';

  it('send is the one primary solid and still submits the form', () => {
    expect(send).toContain('bg-primary text-primary-content border-primary');
    expect(send).toContain('absolute');
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
  });

  it('avatars are soft decorative badges; the send button is the only primary fill', () => {
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(1);
    expect(html).toMatch(/<span class="[^"]*bg-base-300[^"]*w-7 h-7[^"]*" aria-hidden="true">/);
  });
});
