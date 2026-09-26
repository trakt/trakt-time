import { useInfiniteQuery } from '$lib/features/query/useQuery.ts';
import {
  mediaSocialQuery,
  type MediaSocialQueryTarget,
} from '$lib/requests/queries/media/mediaSocialQuery.ts';
import { map } from 'rxjs';
import { sortMediaSocialEntries } from './sortMediaSocialEntries.ts';

const MEDIA_SOCIAL_LIMIT = 100;

export function useMediaSocial(target: MediaSocialQueryTarget) {
  const query = useInfiniteQuery(
    mediaSocialQuery({ ...target, limit: MEDIA_SOCIAL_LIMIT }),
  );

  const entries = query.pipe(
    map(($query) =>
      sortMediaSocialEntries(
        $query.data?.pages.flatMap((page) => page.entries) ?? [],
      )
    ),
  );

  return { entries };
}
