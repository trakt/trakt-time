import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import type { MediaType } from '$lib/requests/models/MediaType.ts';
import { addToFavoritesRequest } from '$lib/requests/sync/addToFavoritesRequest.ts';
import { removeFromFavoritesRequest } from '$lib/requests/sync/removeFromFavoritesRequest.ts';
import { usePendingIntents } from '$lib/sections/media-actions/_internal/pendingIntents.ts';
import { withPendingIntent } from '$lib/sections/media-actions/_internal/withPendingIntent.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { map } from 'rxjs';

export type FavoritesStoreProps = {
  type: MediaType;
  id: number;
  title: string;
};

function getFavoritesPayload({
  type,
  id,
}: Pick<FavoritesStoreProps, 'type' | 'id'>) {
  switch (type) {
    case 'movie':
      return { movies: [{ ids: { trakt: id } }] };
    case 'show':
      return { shows: [{ ids: { trakt: id } }] };
  }
}

export function useFavorites({ type, id }: FavoritesStoreProps) {
  const pending = usePendingIntents(`favorite:${type}:${id}`);
  const isUpdatingFavorite = pending.isPending;
  const { favorites } = useUser();
  const { invalidate } = useInvalidator();

  const isFavoritedOnServer = favorites.pipe(
    map(($favorites) => {
      if (!$favorites) {
        return false;
      }

      switch (type) {
        case 'movie':
          return $favorites.movies.has(id);
        case 'show':
          return $favorites.shows.has(id);
      }
    }),
  );

  const isFavorited = withPendingIntent({
    current: isFavoritedOnServer,
    isAdding: pending.isAdding,
    isRemoving: pending.isRemoving,
  });

  const addOrRemoveFavorite = (action: 'add' | 'remove') =>
    pending.run(action, async () => {
      const payload = getFavoritesPayload({ type, id });

      switch (action) {
        case 'add':
          await addToFavoritesRequest({ body: payload });
          break;
        case 'remove':
          await removeFromFavoritesRequest({ body: payload });
          break;
      }

      await invalidate(InvalidateAction.Favorited(type));
    });

  return {
    isUpdatingFavorite,
    isFavorited,
    addToFavorites: async () => await addOrRemoveFavorite('add'),
    removeFromFavorites: async () => await addOrRemoveFavorite('remove'),
  };
}
