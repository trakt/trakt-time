import type { ExtendedMediaStoreProps } from '$lib/models/MediaStoreProps.ts';
import type { MediaCommentsProps } from './useMediaComments.ts';

const UNKNOWN_SHOW = { id: -1, title: '' };

export function toCommentWatchProps(
  props: MediaCommentsProps,
): ExtendedMediaStoreProps {
  switch (props.type) {
    case 'movie':
      return { type: 'movie', media: { id: props.mediaId } };
    case 'show':
      return {
        type: 'show',
        media: {
          id: props.mediaId,
          episode: props.episodeCount
            ? { count: props.episodeCount }
            : undefined,
        },
      };
    case 'episode':
      return {
        type: 'episode',
        media: {
          id: props.mediaId,
          season: props.season,
          number: props.episode,
        },
        show: props.show ?? UNKNOWN_SHOW,
      };
  }
}
