import { MEDIA_POSTER_PLACEHOLDER } from '$lib/utils/assets.ts';
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

describe('mapToMediaCrew cast headshots', () => {
  const person = (headshot: string[]) => ({
    name: 'Bryan Cranston',
    ids: { slug: 'bryan-cranston', trakt: 1 },
    images: { headshot },
  });

  it('uses the character image as the cast headshot', () => {
    const response = {
      cast: [
        {
          characters: ['Walter White'],
          character_image:
            'media.trakt.tv/characters/1388-297737/medium/headshot.webp',
          person: person(['media.trakt.tv/people/1/medium/headshot.webp']),
        },
      ],
    } as unknown as PeopleResponse;

    expect(mapToMediaCrew(response).cast.at(0)?.headshot.url).toEqual({
      medium:
        'https://media.trakt.tv/characters/1388-297737/medium/headshot.webp',
      thumb:
        'https://media.trakt.tv/characters/1388-297737/thumb/headshot.webp',
    });
  });

  it('uses the character image for guest stars too', () => {
    const response = {
      guest_stars: [
        {
          characters: ['Walter White'],
          character_image:
            'media.trakt.tv/characters/1388-297737/medium/headshot.webp',
          person: person([]),
        },
      ],
    } as unknown as PeopleResponse;

    expect(mapToMediaCrew(response).guestStars.at(0)?.headshot.url.thumb).toBe(
      'https://media.trakt.tv/characters/1388-297737/thumb/headshot.webp',
    );
  });

  it.each([null, undefined, '', '  '])(
    'falls back to the person headshot when the character image is %j',
    (characterImage) => {
      const response = {
        cast: [
          {
            characters: ['Walter White'],
            character_image: characterImage,
            person: person(['media.trakt.tv/people/1/medium/headshot.webp']),
          },
        ],
      } as unknown as PeopleResponse;

      expect(mapToMediaCrew(response).cast.at(0)?.headshot.url.thumb).toBe(
        'https://media.trakt.tv/people/1/thumb/headshot.webp',
      );
    },
  );

  it('falls back to the placeholder without any image', () => {
    const response = {
      cast: [{ characters: ['Hero'], person: person([]) }],
    } as unknown as PeopleResponse;

    expect(mapToMediaCrew(response).cast.at(0)?.headshot.url.thumb).toBe(
      MEDIA_POSTER_PLACEHOLDER,
    );
  });
});

describe('getPeopleExtended', () => {
  it('only requests guest stars when asked to', () => {
    expect(getPeopleExtended(false)).toBe('images');
    expect(getPeopleExtended(true)).toBe('images,guest_stars');
  });
});
