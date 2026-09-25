import type { GifEntry } from '$lib/requests/models/GifEntry.ts';
import { describe, expect, it } from 'vitest';
import { toCommentDraftGif } from './toCommentDraftGif.ts';
import { toCommentGifParams } from './toCommentGifParams.ts';

const gif: GifEntry = {
  id: '42',
  slug: 'mind-blown',
  title: 'Mind blown',
  preview: { url: 'https://static.klipy.com/sm.webp', width: 220, height: 160 },
  full: { url: 'https://static.klipy.com/md.gif', width: 440, height: 320 },
  still: null,
  blurPreview: null,
};

describe('toCommentDraftGif', () => {
  it('keeps the full gif for posting and the light preview for the composer', () => {
    expect(toCommentDraftGif(gif)).toEqual({
      url: 'https://static.klipy.com/md.gif',
      slug: 'mind-blown',
      previewUrl: 'https://static.klipy.com/sm.webp',
      width: 440,
      height: 320,
    });
  });
});

describe('toCommentGifParams', () => {
  it('sends the full gif url with its size', () => {
    expect(toCommentGifParams(toCommentDraftGif(gif))).toEqual({
      url: 'https://static.klipy.com/md.gif',
      width: 440,
      height: 320,
    });
  });

  it('sends no gif when none is attached', () => {
    expect(toCommentGifParams(null)).toBeNull();
  });
});
