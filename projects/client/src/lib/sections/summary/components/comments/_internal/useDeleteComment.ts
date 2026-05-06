import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { deleteCommentRequest } from '$lib/requests/queries/comments/deleteCommentRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject } from 'rxjs';

type UseDeleteCommentProps = {
  type: ExtendedMediaType;
};

export function useDeleteComment({ type }: UseDeleteCommentProps) {
  const isDeleting = new BehaviorSubject(false);
  const { invalidate } = useInvalidator();

  const deleteComment = async (id: number) => {
    isDeleting.next(true);
    try {
      await deleteCommentRequest({ id });
      // Invalidate both top-level and reply lists so the UI catches up
      // whether we removed a parent or a child comment.
      await Promise.all([
        invalidate(InvalidateAction.Comment.Post(type)),
        invalidate(InvalidateAction.Comment.Reply(type)),
      ]);
    } finally {
      isDeleting.next(false);
    }
  };

  return { deleteComment, isDeleting };
}
