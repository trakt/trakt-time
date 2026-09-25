import type { CommentDraftGif } from './CommentDraftGif.ts';

export function toCommentGifParams(gif: CommentDraftGif | Nil) {
  if (!gif) return null;

  return { url: gif.url, width: gif.width, height: gif.height };
}
