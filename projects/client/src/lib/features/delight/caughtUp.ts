import { BehaviorSubject, map } from 'rxjs';

const caughtUpShows = new BehaviorSubject<ReadonlySet<number>>(new Set());

export function announceCaughtUp(showId: number) {
  caughtUpShows.next(new Set([...caughtUpShows.value, showId]));
}

export function isCaughtUp(showId: number) {
  return caughtUpShows.pipe(map((shows) => shows.has(showId)));
}
