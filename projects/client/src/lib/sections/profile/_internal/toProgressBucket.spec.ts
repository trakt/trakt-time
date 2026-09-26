import type { ProgressEntry } from '$lib/requests/models/ProgressEntry.ts';
import { describe, expect, it } from 'vitest';
import { toProgressBucket } from './toProgressBucket.ts';

const entry = (key: string, status: string) =>
  ({ key, show: { status } }) as unknown as ProgressEntry;

const completed = [entry('airing', 'returning series'), entry('done', 'ended')];

describe('toProgressBucket', () => {
  it('splits completed shows into up to date and ended', () => {
    const params = { watching: [], dropped: [], completed };

    expect(
      toProgressBucket({ ...params, tab: 'completed' }).map(({ key }) => key),
    ).toEqual(['airing']);
    expect(
      toProgressBucket({ ...params, tab: 'ended' }).map(({ key }) => key),
    ).toEqual(['done']);
  });

  it('passes watching and dropped through', () => {
    const watching = [entry('w', 'returning series')];
    const dropped = [entry('d', 'ended')];

    expect(
      toProgressBucket({ tab: 'in-progress', watching, dropped, completed }),
    ).toBe(watching);
    expect(toProgressBucket({ tab: 'dropped', watching, dropped, completed }))
      .toBe(dropped);
  });
});
