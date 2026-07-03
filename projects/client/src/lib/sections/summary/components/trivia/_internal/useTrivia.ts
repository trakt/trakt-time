import { useQuery } from '$lib/features/query/useQuery.ts';
import type { MediaType } from '$lib/requests/models/MediaType.ts';
import { movieTriviaQuery } from '$lib/requests/queries/movies/movieTriviaQuery.ts';
import { showTriviaQuery } from '$lib/requests/queries/shows/showTriviaQuery.ts';
import { toLoadingState } from '$lib/utils/requests/toLoadingState.ts';
import { map } from 'rxjs';

type UseTriviaProps = {
  slug: string;
  type: MediaType;
};

function toQuery({ slug, type }: UseTriviaProps) {
  switch (type) {
    case 'movie':
      return movieTriviaQuery({ slug });
    case 'show':
      return showTriviaQuery({ slug });
  }
}

export function useTrivia(props: UseTriviaProps) {
  const query = useQuery(toQuery(props));

  return {
    items: query.pipe(map(($query) => $query.data?.items ?? [])),
    summary: query.pipe(map(($query) => $query.data?.summary ?? [])),
    isLoading: query.pipe(map(toLoadingState)),
  };
}
