import type { MediaSocial } from '$lib/requests/models/MediaSocial.ts';

function hasPlays(entry: MediaSocial) {
  return entry.watched != null;
}

function minutesWatched(entry: MediaSocial) {
  return entry.watched?.minutesWatched ?? 0;
}
const ACTIVITY_WEIGHTS = {
  watchlisted: 1,
  rating: 2,
  comment: 2,
} as const;

function activityScore(entry: MediaSocial) {
  return (
    (entry.watchlisted != null ? ACTIVITY_WEIGHTS.watchlisted : 0) +
    (entry.watched?.rating != null ? ACTIVITY_WEIGHTS.rating : 0) +
    (entry.watched?.comment != null ? ACTIVITY_WEIGHTS.comment : 0)
  );
}

function watchedPlays(entry: MediaSocial) {
  return entry.watched?.plays ?? 0;
}

function dateValue(date: Date | null | undefined) {
  return date?.getTime() ?? 0;
}

function lastActivityDate(entry: MediaSocial) {
  return Math.max(
    dateValue(entry.watched?.rating?.ratedAt),
    dateValue(entry.watched?.comment?.updatedAt),
    dateValue(entry.watched?.comment?.createdAt),
    dateValue(entry.watched?.lastUpdatedAt),
    dateValue(entry.watched?.lastWatchedAt),
    dateValue(entry.watchlisted?.listedAt),
  );
}

function compareDescending(a: number, b: number) {
  return b - a;
}

function compareSocialEntry(a: MediaSocial, b: MediaSocial) {
  return (
    compareDescending(Number(hasPlays(a)), Number(hasPlays(b))) ||
    compareDescending(minutesWatched(a), minutesWatched(b)) ||
    compareDescending(watchedPlays(a), watchedPlays(b)) ||
    compareDescending(activityScore(a), activityScore(b)) ||
    compareDescending(lastActivityDate(a), lastActivityDate(b)) ||
    a.user.username.localeCompare(b.user.username)
  );
}

export function sortMediaSocialEntries(entries: MediaSocial[]) {
  return [...entries].sort(compareSocialEntry);
}
