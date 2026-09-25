import type { GifEntry } from '$lib/requests/models/GifEntry.ts';
import type { CommentDraftGif } from './CommentDraftGif.ts';

export function toCommentDraftGif(gif: GifEntry): CommentDraftGif {
  return {
    url: gif.full.url,
    slug: gif.slug,
    previewUrl: gif.preview.url,
    width: gif.full.width,
    height: gif.full.height,
  };
}
