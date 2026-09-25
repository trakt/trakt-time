import type { EpisodeEntry } from '$lib/requests/models/EpisodeEntry.ts';
import type { MovieEntry } from '$lib/requests/models/MovieEntry.ts';
import type { PersonSummary } from '$lib/requests/models/PersonSummary.ts';
import type { ShowEntry } from '$lib/requests/models/ShowEntry.ts';
import { describe, expect, it } from 'vitest';
import { toEpisodeJsonLd } from './toEpisodeJsonLd.ts';
import { toFaqJsonLd } from './toFaqJsonLd.ts';
import { toMovieJsonLd } from './toMovieJsonLd.ts';
import { toPersonJsonLd } from './toPersonJsonLd.ts';
import { toShowJsonLd } from './toShowJsonLd.ts';
import { toSiteJsonLd } from './toSiteJsonLd.ts';

const images = {
  medium: 'https://walter-r2.trakt.tv/medium.jpg',
  thumb: 'https://walter-r2.trakt.tv/thumb.jpg',
} as const;

const show = {
  title: 'Severance',
  poster: { url: images },
  cover: { url: images },
  genres: ['drama', 'mystery'],
  airDate: new Date('2022-02-18T00:00:00.000Z'),
  episode: { count: 19 },
  certification: 'TV-MA',
  rating: 0.8734,
  votes: 25000,
} as unknown as ShowEntry;

const movie = {
  title: 'Dune: Part Two',
  poster: { url: images },
  genres: ['science-fiction'],
  releaseDate: new Date('2024-03-01T00:00:00.000Z'),
  runtime: 167,
  certification: 'PG-13',
  rating: 0.86,
  votes: 0,
} as unknown as MovieEntry;

const episode = {
  title: 'Hello, Ms. Cobel',
  season: 2,
  number: 1,
  cover: { url: null },
  airDate: new Date('2025-01-17T00:00:00.000Z'),
  runtime: 54,
} as unknown as EpisodeEntry;

const person = {
  name: 'Adam Scott',
  headshot: { url: images },
  birthday: new Date('1973-04-03T00:00:00.000Z'),
  deathDate: null,
  imdb: 'nm0778906',
} as unknown as PersonSummary;

describe('json-ld builders', () => {
  it('should describe a show as a TVSeries with its rating', () => {
    const data = toShowJsonLd({
      show,
      title: 'Severance',
      description: 'Office workers.',
      url: 'https://tvtime.trakt.tv/shows/severance',
    });

    expect(data).toMatchObject({
      '@type': 'TVSeries',
      name: 'Severance',
      startDate: '2022-02-18',
      numberOfEpisodes: 19,
      contentRating: 'TV-MA',
      aggregateRating: { ratingValue: 8.7, bestRating: 10, ratingCount: 25000 },
    });
  });

  it('should leave out the rating when nobody has voted', () => {
    const data = toMovieJsonLd({
      movie,
      title: 'Dune: Part Two',
      description: '',
      url: 'https://tvtime.trakt.tv/movies/dune-part-two-2024',
    });

    expect(data).toMatchObject({
      '@type': 'Movie',
      datePublished: '2024-03-01',
      duration: 'PT167M',
    });
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data).not.toHaveProperty('description');
  });

  it('should link an episode to its season and show', () => {
    const data = toEpisodeJsonLd({
      episode,
      show,
      title: 'Hello, Ms. Cobel',
      description: 'Mark returns.',
      url: 'https://tvtime.trakt.tv/shows/severance/seasons/2/episodes/1',
      showUrl: 'https://tvtime.trakt.tv/shows/severance',
    });

    expect(data).toMatchObject({
      '@type': 'TVEpisode',
      episodeNumber: 1,
      image: images.medium,
      partOfSeason: { seasonNumber: 2 },
      partOfSeries: {
        name: 'Severance',
        url: 'https://tvtime.trakt.tv/shows/severance',
      },
    });
  });

  it('should describe a person with their IMDb profile', () => {
    const data = toPersonJsonLd({
      person,
      description: 'Actor.',
      url: 'https://tvtime.trakt.tv/people/adam-scott',
    });

    expect(data).toMatchObject({
      '@type': 'Person',
      birthDate: '1973-04-03',
      sameAs: ['https://www.imdb.com/name/nm0778906/'],
    });
    expect(data).not.toHaveProperty('deathDate');
  });

  it('should describe the site and the app', () => {
    const [site, app] = toSiteJsonLd({
      origin: 'https://tvtime.trakt.tv',
      description: 'Track shows.',
    });

    expect(site).toMatchObject({
      '@type': 'WebSite',
      url: 'https://tvtime.trakt.tv/',
    });
    expect(app).toMatchObject({
      '@type': 'WebApplication',
      offers: { price: '0' },
    });
  });

  it('should describe questions and answers as an FAQPage', () => {
    const data = toFaqJsonLd([
      { question: 'Is it free?', answer: 'Yes.' },
      { question: 'Can I import?', answer: 'From TV Time, yes.' },
    ]);

    expect(data).toMatchObject({
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is it free?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes.' },
        },
        { name: 'Can I import?' },
      ],
    });
  });
});
