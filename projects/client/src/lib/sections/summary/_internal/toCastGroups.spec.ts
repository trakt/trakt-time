import type { CastMember } from '$lib/requests/models/MediaCrew.ts';
import { describe, expect, it } from 'vitest';
import { toActiveCastGroupType, toCastGroups } from './toCastGroups.ts';

function makeMember(key: string): CastMember {
  return {
    key,
    name: key,
    characterName: '',
    headshot: {
      url: {
        medium: 'https://example.com/a.jpg',
        thumb: 'https://example.com/a.jpg',
      },
    },
  };
}

describe('toCastGroups', () => {
  it('splits main and supporting cast when both exist', () => {
    const groups = toCastGroups({
      cast: [makeMember('lead')],
      guestStars: [makeMember('guest')],
    });

    expect(groups.map(({ type }) => type)).toEqual(['main', 'supporting']);
    expect(groups.at(1)?.members.map(({ key }) => key)).toEqual(['guest']);
  });

  it('folds guest stars into a single group without a main cast', () => {
    const groups = toCastGroups({
      cast: [],
      guestStars: [makeMember('guest')],
    });

    expect(groups).toHaveLength(1);
    expect(groups.at(0)?.type).toBe('main');
    expect(groups.at(0)?.members.map(({ key }) => key)).toEqual(['guest']);
  });

  it('keeps a single main group when there are no guest stars', () => {
    const groups = toCastGroups({
      cast: [makeMember('lead')],
      guestStars: [],
    });

    expect(groups.map(({ type }) => type)).toEqual(['main']);
  });

  it('returns no groups for an empty cast', () => {
    expect(toCastGroups({ cast: [], guestStars: [] })).toEqual([]);
  });
});

describe('toActiveCastGroupType', () => {
  it('keeps the selection when the group exists', () => {
    const groups = toCastGroups({
      cast: [makeMember('lead')],
      guestStars: [makeMember('guest')],
    });

    expect(toActiveCastGroupType({ groups, selected: 'supporting' })).toBe(
      'supporting',
    );
  });

  it('falls back to the first group when the selection is gone', () => {
    const groups = toCastGroups({ cast: [makeMember('lead')], guestStars: [] });

    expect(toActiveCastGroupType({ groups, selected: 'supporting' })).toBe(
      'main',
    );
  });
});
