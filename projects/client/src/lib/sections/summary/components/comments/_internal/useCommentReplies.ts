import { commentRepliesQuery } from '$lib/requests/queries/comments/commentRepliesQuery.ts';
import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
import { DEFAULT_PAGE_SIZE } from '$lib/utils/constants.ts';

type UseCommentRepliesProps = {
  id: number;
  limit?: number;
};

export function useCommentReplies({ id, limit }: UseCommentRepliesProps) {
  return usePaginatedListQuery(
    commentRepliesQuery({ id, limit: limit ?? DEFAULT_PAGE_SIZE }),
  );
}
