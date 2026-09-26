import { useQuery } from '$lib/features/query/useQuery.ts';
import type { NowPlayingItem } from '$lib/requests/models/NowPlayingItem.ts';
import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
import { userWatchingQuery } from '$lib/requests/queries/users/userWatchingQuery.ts';
import { combineLatest, map, of } from 'rxjs';

export type WatchingNow = {
  profile: UserProfile;
  item: NowPlayingItem;
};

export function useWatchingNow(profiles: ReadonlyArray<UserProfile>) {
  if (profiles.length === 0) {
    return { watching: of<WatchingNow[]>([]), isLoading: of(false) };
  }

  const queries = combineLatest(
    profiles.map((profile) =>
      useQuery(userWatchingQuery({ slug: profile.slug ?? profile.username }))
        .pipe(map((query) => ({ profile, query })))
    ),
  );

  return {
    watching: queries.pipe(
      map((results) =>
        results.flatMap(({ profile, query }) =>
          query.data ? [{ profile, item: query.data }] : []
        )
      ),
    ),
    isLoading: queries.pipe(
      map((results) => results.some(({ query }) => query.isLoading)),
    ),
  };
}
