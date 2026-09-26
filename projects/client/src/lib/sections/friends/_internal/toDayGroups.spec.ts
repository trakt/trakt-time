import type { SocialActivity } from '$lib/requests/models/SocialActivity.ts';
import { describe, expect, it } from 'vitest';
import { toDayGroups } from './toDayGroups.ts';

const activity = (key: string, iso: string) =>
  ({ key, activityAt: new Date(iso) }) as SocialActivity;

describe('toDayGroups', () => {
  it('groups activities by local day, keeping feed order', () => {
    const groups = toDayGroups([
      activity('a', '2026-09-26T20:00:00'),
      activity('b', '2026-09-26T08:00:00'),
      activity('c', '2026-09-25T22:00:00'),
    ]);

    expect(groups.map((group) => group.dayKey)).toEqual([
      '2026-09-26',
      '2026-09-25',
    ]);
    expect(groups[0]?.activities.map(({ key }) => key)).toEqual(['a', 'b']);
  });
});
