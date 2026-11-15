import { describe, expect, it } from 'vitest';
import type { CommentDraftGif } from './CommentDraftGif.ts';
import { hasCommentDraft } from './hasCommentDraft.ts';

const gif: CommentDraftGif = {
  url: 'https://example.com/wave.gif',
  slug: 'wave',
  previewUrl: 'https://example.com/wave-preview.gif',
  width: 200,
  height: 120,
};

describe('hasCommentDraft', () => {
  it('should be empty for blank and whitespace-only text', () => {
    expect(hasCommentDraft({ text: '', gif: null })).toBe(false);
    expect(hasCommentDraft({ text: ' \n\t ', gif: null })).toBe(false);
  });

  it('should hold a draft when there is typed text', () => {
    expect(hasCommentDraft({ text: 'Great finale', gif: null })).toBe(true);
  });

  it('should hold a draft when only a gif is attached', () => {
    expect(hasCommentDraft({ text: '', gif })).toBe(true);
  });
});
