import type { UserProfile } from '$lib/requests/models/UserProfile.ts';
import { describe, expect, it } from 'vitest';
import { toFollowStatus } from './useFollowUser.ts';

const profile = (slug: string) => ({ slug } as UserProfile);

describe('toFollowStatus', () => {
  it('is following when the slug is in the following list', () => {
    expect(
      toFollowStatus({
        slug: 'maria',
        following: [profile('maria')],
        pending: [],
      }),
    ).toBe('following');
  });

  it('ignores slug casing from the url', () => {
    expect(
      toFollowStatus({
        slug: 'Rastan',
        following: [profile('rastan')],
        pending: [],
      }),
    ).toBe('following');
  });

  it('is pending when a request is outstanding', () => {
    expect(
      toFollowStatus({ slug: 'tom', following: [], pending: [profile('tom')] }),
    ).toBe('pending');
  });

  it('is none otherwise', () => {
    expect(toFollowStatus({ slug: 'lena', following: [], pending: [] })).toBe(
      'none',
    );
  });
});
