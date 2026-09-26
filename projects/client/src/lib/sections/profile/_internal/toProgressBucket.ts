import type { ProgressEntry } from '$lib/requests/models/ProgressEntry.ts';
import { hasEnded } from '$lib/utils/media/hasEnded.ts';

export const PROGRESS_TABS = [
  'in-progress',
  'completed',
  'ended',
  'dropped',
] as const;

export type ProgressTab = typeof PROGRESS_TABS[number];

type ToProgressBucketParams = {
  tab: ProgressTab;
  watching: ReadonlyArray<ProgressEntry>;
  completed: ReadonlyArray<ProgressEntry>;
  dropped: ReadonlyArray<ProgressEntry>;
};

export function toProgressBucket(
  { tab, watching, completed, dropped }: ToProgressBucketParams,
): ReadonlyArray<ProgressEntry> {
  switch (tab) {
    case 'in-progress':
      return watching;
    case 'completed':
      return completed.filter((entry) => !hasEnded(entry.show.status));
    case 'ended':
      return completed.filter((entry) => hasEnded(entry.show.status));
    case 'dropped':
      return dropped;
  }
}
