import type { CommentSortType } from '$lib/requests/models/CommentSortType.ts';
import { useComments } from '$lib/sections/summary/components/comments/_internal/useComments.ts';

const COMMENTS_PAGE_SIZE = 10;

export type MediaCommentsProps =
  & {
    slug: string;
    mediaId: number;
    mediaTitle: string;
    sort?: CommentSortType;
  }
  & (
    | { type: 'movie' | 'show' }
    | { type: 'episode'; season: number; episode: number }
  );

export function useMediaComments(props: MediaCommentsProps) {
  const sort = props.sort ?? 'likes';

  if (props.type === 'episode') {
    return useComments({
      type: 'episode',
      slug: props.slug,
      season: props.season,
      episode: props.episode,
      id: props.mediaId,
      sort,
      limit: COMMENTS_PAGE_SIZE,
    });
  }

  return useComments({
    type: props.type,
    slug: props.slug,
    sort,
    limit: COMMENTS_PAGE_SIZE,
  });
}
