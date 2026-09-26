import type { MediaStatus } from '$lib/requests/models/MediaStatus.ts';

const ENDED_STATUSES: ReadonlySet<MediaStatus> = new Set([
  'ended',
  'canceled',
]);

export function hasEnded(status: MediaStatus): boolean {
  return ENDED_STATUSES.has(status);
}
