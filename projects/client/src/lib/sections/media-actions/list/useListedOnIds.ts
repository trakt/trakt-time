import { useQuery } from '$lib/features/query/useQuery.ts';
import { userMovieListIdsQuery } from '$lib/requests/queries/users/userMovieListIdsQuery.ts';
import { userShowListIdsQuery } from '$lib/requests/queries/users/userShowListIdsQuery.ts';
import { toLoadingState } from '$lib/utils/requests/toLoadingState.ts';
import { map } from 'rxjs';

type UseListedOnIdsProps = {
  type: 'movie' | 'show';
  slug: string;
};

function typeToQuery({ type, slug }: UseListedOnIdsProps) {
  switch (type) {
    case 'movie':
      return userMovieListIdsQuery({ slug });
    case 'show':
      return userShowListIdsQuery({ slug });
  }
}

export function useListedOnIds(props: UseListedOnIdsProps) {
  const response = useQuery(typeToQuery(props));

  return {
    listedOnIds: response.pipe(map(($response) => $response.data ?? [])),
    isLoading: response.pipe(map(toLoadingState)),
  };
}
