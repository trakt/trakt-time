import type { ListItem } from '$lib/requests/models/ListItem.ts';

export function toListItemPoster(item: ListItem): string {
  switch (item.type) {
    case 'movie':
    case 'show':
      return item.entry.poster.url.thumb;
    case 'episode':
    case 'season':
      return item.entry.show.poster.url.thumb;
  }
}
