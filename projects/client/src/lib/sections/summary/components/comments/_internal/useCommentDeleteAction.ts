import { ConfirmationType } from '$lib/features/confirmation/models/ConfirmationType.ts';
import { useConfirm } from '$lib/features/confirmation/useConfirm.ts';
import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
import type { MediaComment } from '$lib/requests/models/MediaComment.ts';
import { useDeleteComment } from './useDeleteComment.ts';

type Props = {
  type: ExtendedMediaType;
  onDeleted?: (comment: MediaComment) => void;
};

export function useCommentDeleteAction({ type, onDeleted }: Props) {
  const { deleteComment, isDeleting } = useDeleteComment({ type });
  const { confirm } = useConfirm();

  const onDelete = (comment: MediaComment) => {
    confirm({
      type: ConfirmationType.DeleteComment,
      onConfirm: async () => {
        await deleteComment(comment.id);
        onDeleted?.(comment);
      },
    })();
  };

  return { onDelete, isDeleting };
}
