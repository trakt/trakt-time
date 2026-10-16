import type { PeopleResponse } from '@trakt/api';
import { describe, expect, it } from 'vitest';
import { getPeopleExtended } from './getPeopleExtended.ts';
import { mapToMediaCrew } from './mapToMediaCrew.ts';

function makeCast(slug: string, character: string) {
  return {
    characters: [character],
    person: {
      name: slug,
      ids: { slug },
      images: undefined,
    },
  };
}

describe('mapToMediaCrew', () => {
  it('maps guest stars next to the main cast', () => {
    const response = {
      cast: [makeCast('lead', 'Hero')],
      guest_stars: [makeCast('guest', 'Villain')],
    } as unknown as PeopleResponse;

    const crew = mapToMediaCrew(response);

    expect(crew.cast.map(({ key }) => key)).toEqual(['lead']);
    expect(crew.guestStars.map(({ key }) => key)).toEqual(['guest']);
    expect(crew.guestStars.at(0)?.characterName).toBe('Villain');
  });

  it('returns no guest stars when the response has none', () => {
    const response = {
      cast: [makeCast('lead', 'Hero')],
    } as unknown as PeopleResponse;

    expect(mapToMediaCrew(response).guestStars).toEqual([]);
  });
});

describe('getPeopleExtended', () => {
  it('only requests guest stars when asked to', () => {
    expect(getPeopleExtended(false)).toBe('images');
    expect(getPeopleExtended(true)).toBe('images,guest_stars');
  });
});
