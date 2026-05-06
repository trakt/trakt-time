import * as m from '$lib/paraglide/messages.js';
import { CommentError } from './models/CommentError.ts';

export function toCommentErrorMessage(error: CommentError | null) {
  if (error === CommentError.InvalidContent) {
    return m.error_text_comment_invalid_content();
  }
  if (error === CommentError.Unknown) {
    return m.error_text_comment_unknown();
  }
  return null;
}
