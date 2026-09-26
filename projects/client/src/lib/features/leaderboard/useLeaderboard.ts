import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import type { LeaderboardEntry } from '$lib/requests/models/LeaderboardEntry.ts';
import { userLeaderboardQuery } from '$lib/requests/queries/users/userLeaderboardQuery.ts';
import { userStatsQuery } from '$lib/requests/queries/users/userStatsQuery.ts';
import { usePaginatedListQuery } from '$lib/sections/lists/stores/usePaginatedListQuery.ts';
import { combineLatest, map } from 'rxjs';
import { toViewerProfile } from './toViewerProfile.ts';
import { weaveViewer } from './weaveViewer.ts';

const LEADERBOARD_LIMIT = 50;

export function useLeaderboard() {
  const { list, isLoading } = usePaginatedListQuery(
    userLeaderboardQuery({ slug: 'me', limit: LEADERBOARD_LIMIT }),
  );
  const { user } = useUser();
  const ownStats = useQuery(userStatsQuery({ slug: 'me' }));

  const entries = combineLatest([list, user, ownStats]).pipe(
    map(([$list, $user, $stats]) => {
      const stats = $stats.data;
      const viewer: LeaderboardEntry | null = $user.isVip && stats
        ? {
          key: 'leaderboard-viewer',
          rank: null,
          user: toViewerProfile($user),
          totalMinutes: stats.movies.minutes + stats.episodes.minutes,
          totalPlays: stats.movies.plays + stats.episodes.plays,
          locked: false,
          isViewer: true,
        }
        : null;

      return weaveViewer($list, viewer);
    }),
  );

  const viewerRank = entries.pipe(
    map(($entries) => $entries.find((entry) => entry.isViewer)?.rank ?? null),
  );

  return { entries, viewerRank, isLoading };
}
