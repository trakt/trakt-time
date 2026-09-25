import { useComments } from '$lib/sections/summary/components/comments/_internal/useComments.ts';

const COMMENTS_PAGE_SIZE = 10;

export type MediaCommentsProps =
  & {
    slug: string;
    mediaId: number;
    mediaTitle: string;
  }
  & (
    | { type: 'movie' | 'show' }
    | { type: 'episode'; season: number; episode: number }
  );

export function useMediaComments(props: MediaCommentsProps) {
  if (props.type === 'episode') {
    return useComments({
      type: 'episode',
      slug: props.slug,
      season: props.season,
      episode: props.episode,
      id: props.mediaId,
      sort: 'likes',
      limit: COMMENTS_PAGE_SIZE,
    });
  }

  return useComments({
    type: props.type,
    slug: props.slug,
    sort: 'likes',
    limit: COMMENTS_PAGE_SIZE,
  });
}
