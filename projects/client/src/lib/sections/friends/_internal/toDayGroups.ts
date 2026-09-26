import type { SocialActivity } from '$lib/requests/models/SocialActivity.ts';
import { toLocalDayKey } from '$lib/utils/date/toLocalDayKey.ts';

export type ActivityDayGroup = {
  dayKey: string;
  activities: ReadonlyArray<SocialActivity>;
};

export function toDayGroups(
  activities: ReadonlyArray<SocialActivity>,
): ReadonlyArray<ActivityDayGroup> {
  const groups = Map.groupBy(
    activities,
    (activity) => toLocalDayKey(activity.activityAt),
  );

  return Array.from(groups, ([dayKey, dayActivities]) => ({
    dayKey,
    activities: dayActivities,
  }));
}
