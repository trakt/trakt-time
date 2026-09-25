import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import { streamMovieQuery } from '$lib/requests/queries/movies/streamMovieQuery.ts';
import { streamingSourcesQuery } from '$lib/requests/queries/services/streamingSourcesQuery.ts';
import { streamShowQuery } from '$lib/requests/queries/shows/streamShowQuery.ts';
import { combineLatest, map } from 'rxjs';
import { toWhereToWatchServices } from './_internal/toWhereToWatchServices.ts';

const DEFAULT_COUNTRY = 'us';

type UseWhereToWatchProps = {
  type: 'show' | 'movie';
  slug: string;
};

const toStreamQuery = (
  { type, slug, country }: UseWhereToWatchProps & { country: string },
) =>
  type === 'show'
    ? streamShowQuery({ slug, country })
    : streamMovieQuery({ slug, country });

export function useWhereToWatch({ type, slug }: UseWhereToWatchProps) {
  const { user } = useUser();
  const sourcesQuery = useQuery(streamingSourcesQuery());

  const country = user.pipe(
    map(($user) => $user?.services.country || DEFAULT_COUNTRY),
  );

  const streamQuery = useQuery(
    country.pipe(
      map(($country) => toStreamQuery({ type, slug, country: $country })),
    ),
  );

  const services = combineLatest([streamQuery, sourcesQuery, country]).pipe(
    map(([$stream, $sources, $country]) => {
      if (!$stream.data) return [];

      return toWhereToWatchServices({
        options: $stream.data,
        sources: $sources.data?.get($country) ?? [],
      });
    }),
  );

  const isLoading = streamQuery.pipe(map(($stream) => $stream.isLoading));

  return { services, isLoading };
}
