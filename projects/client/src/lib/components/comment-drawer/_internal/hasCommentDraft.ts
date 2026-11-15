import type { CommentDraftGif } from './CommentDraftGif.ts';

type CommentDraft = {
  text: string;
  gif: CommentDraftGif | null;
};

export function hasCommentDraft({ text, gif }: CommentDraft) {
  return text.trim().length > 0 || gif != null;
}
