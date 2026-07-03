import { describe, expect, it } from 'vitest';
import { decodeRecord, UrlBuilder } from './UrlBuilder.ts';

describe('UrlBuilder', () => {
  describe('history', () => {
    it('builds the history home url', () => {
      expect(UrlBuilder.history.home()).toBe('/history');
    });

    it('builds a category drilldown url with pluralized type', () => {
      expect(UrlBuilder.history.category({ type: 'show', page: 2 })).toBe(
        '/history/shows?page=2',
      );
    });

    it('omits the query string when no params are set', () => {
      expect(UrlBuilder.history.category({ type: 'movie' })).toBe(
        '/history/movies',
      );
    });

    it('builds the all history url with a page param', () => {
      expect(UrlBuilder.history.all({ type: 'media', page: 3 })).toBe(
        '/history?page=3',
      );
    });

    it('builds media specific history urls', () => {
      expect(UrlBuilder.history.movie('heat-1995')).toBe(
        '/history/movies/heat-1995',
      );
      expect(UrlBuilder.history.show('the-wire')).toBe(
        '/history/shows/the-wire',
      );
      expect(UrlBuilder.history.episode('the-wire', 2, 6)).toBe(
        '/history/shows/the-wire/seasons/2/episodes/6',
      );
    });
  });

  describe('discover drilldowns', () => {
    it('returns the base url without params', () => {
      expect(UrlBuilder.trending()).toBe('/discover/trending');
      expect(UrlBuilder.recommended()).toBe('/discover/recommended');
      expect(UrlBuilder.anticipated()).toBe('/discover/anticipated');
      expect(UrlBuilder.popular()).toBe('/discover/popular');
    });

    it('appends well known params', () => {
      expect(UrlBuilder.trending({ mode: 'show' })).toBe(
        '/discover/trending?mode=show',
      );
    });

    it('encodes the search record as a round-trippable param', () => {
      const url = UrlBuilder.trending({
        search: { query: 'the wire', year: 2008 },
      });
      const params = new URLSearchParams(url.split('?').at(1));

      expect(decodeRecord(params.get('search') ?? '')).toEqual({
        query: 'the wire',
        year: 2008,
      });
    });
  });

  describe('decodeRecord', () => {
    it('returns an empty record for malformed input', () => {
      expect(decodeRecord('not-json')).toEqual({});
      expect(decodeRecord('%')).toEqual({});
    });
  });

  describe('media urls', () => {
    it('dispatches media urls by type', () => {
      expect(UrlBuilder.media('show', 'breaking-bad')).toBe(
        '/shows/breaking-bad',
      );
      expect(UrlBuilder.media('movie', 'heat-1995')).toBe(
        '/movies/heat-1995',
      );
    });

    it('builds a show url with params', () => {
      expect(UrlBuilder.show('breaking-bad', { display: 'show' })).toBe(
        '/shows/breaking-bad?display=show',
      );
    });

    it('builds an episode url', () => {
      expect(UrlBuilder.episode('breaking-bad', 5, 14)).toBe(
        '/shows/breaking-bad/seasons/5/episodes/14',
      );
    });

    it('builds related and popular lists urls', () => {
      expect(UrlBuilder.related.movie('heat-1995')).toBe(
        '/movies/heat-1995/related',
      );
      expect(UrlBuilder.related.episode('the-wire', 1, 1)).toBe(
        '/shows/the-wire/seasons/1/episodes/1/related',
      );
      expect(UrlBuilder.popularLists.show('the-wire')).toBe(
        '/shows/the-wire/lists',
      );
    });

    it('builds a people url with crew positions as params', () => {
      expect(UrlBuilder.people('bryan-cranston')).toBe(
        '/people/bryan-cranston',
      );
      expect(UrlBuilder.people('bryan-cranston', { movies: 'acting' })).toBe(
        '/people/bryan-cranston?movies=acting',
      );
    });
  });

  describe('profile', () => {
    it('builds profile urls', () => {
      expect(UrlBuilder.profile.me()).toBe('/profile/me');
      expect(UrlBuilder.profile.user('vlad')).toBe('/profile/vlad');
      expect(UrlBuilder.profile.history('vlad')).toBe(
        '/profile/vlad/history',
      );
    });

    it('builds a favorites url with sanitized params', () => {
      expect(UrlBuilder.profile.favorites('vlad', { sort_by: 'rank' })).toBe(
        '/profile/vlad/favorites?sort_by=rank',
      );
    });
  });

  describe('users', () => {
    it('builds user scoped urls', () => {
      const user = UrlBuilder.users('vlad');

      expect(user.lists('watch-soon')).toBe('/users/vlad/lists/watch-soon');
      expect(user.yearToDate(2025)).toBe('/users/vlad/year/2025');
      expect(user.monthInReview(2025, 6)).toBe('/users/vlad/mir/2025/6');
    });
  });

  describe('lists', () => {
    it('builds smart list urls', () => {
      expect(UrlBuilder.lists.smart.create()).toBe('/lists/smart/create');
      expect(UrlBuilder.lists.smart.view(7)).toBe('/lists/smart/view/7');
    });

    it('builds an official list url preserving the type param', () => {
      expect(UrlBuilder.lists.official('top-250', { page: 2, type: 'movie' }))
        .toBe('/lists/official/top-250?page=2&type=movie');
    });

    it('builds user list urls with and without params', () => {
      expect(UrlBuilder.lists.user('vlad')).toBe('/users/vlad/lists');
      expect(UrlBuilder.lists.user('vlad', { type: 'show', page: 3 })).toBe(
        '/users/vlad/lists/shows?page=3',
      );
    });

    it('builds a watchlist url', () => {
      expect(UrlBuilder.lists.watchlist('vlad', { display: 'movie' })).toBe(
        '/users/vlad/watchlist?display=movie',
      );
    });

    it('maps collaboration lists to the collaborations segment', () => {
      expect(UrlBuilder.lists.all('vlad', 'collaboration')).toBe(
        '/users/vlad/lists/view/collaborations',
      );
      expect(UrlBuilder.lists.all('vlad', 'personal')).toBe(
        '/users/vlad/lists/view/personal',
      );
      expect(UrlBuilder.lists.all('vlad', 'liked')).toBe(
        '/users/vlad/lists/view/liked',
      );
    });
  });

  describe('progress and library', () => {
    it('builds progress urls with sanitized params', () => {
      expect(UrlBuilder.progress('me')).toBe('/users/me/progress');
      expect(UrlBuilder.progress('me', { page: 2 })).toBe(
        '/users/me/progress?page=2',
      );
    });

    it('builds library urls', () => {
      expect(UrlBuilder.library.home()).toBe('/users/me/library');
      expect(UrlBuilder.library.me('watchlist')).toBe(
        '/users/me/library?library=watchlist',
      );
    });
  });

  describe('settings', () => {
    it('builds settings urls', () => {
      expect(UrlBuilder.settings.general()).toBe('/settings');
      expect(UrlBuilder.settings.advanced()).toBe('/settings/advanced');
      expect(UrlBuilder.settings.advanced({ section: 'debug' })).toBe(
        '/settings/advanced?section=debug',
      );
    });
  });

  describe('og frames', () => {
    it('builds the settings frame with embedded mode and access token', () => {
      const url = UrlBuilder.og.frame.settings('token-123');

      expect(url.startsWith('https://trakt.tv/settings/?embedded_mode=true'))
        .toBe(true);
      expect(url).toContain('&access_token=token-123');
      expect(url).toContain('&client_id=');
    });

    it('only allows the advanced settings section', () => {
      expect(UrlBuilder.og.frame.settings('token-123', 'advanced'))
        .toContain('https://trakt.tv/settings/advanced/?embedded_mode=true');
      expect(UrlBuilder.og.frame.settings('token-123', 'evil-section'))
        .toContain('https://trakt.tv/settings/?embedded_mode=true');
    });

    it('appends the slurm token to year to date frames when present', () => {
      expect(UrlBuilder.og.frame.yearToDate('vlad', '2025', 'slurm-token'))
        .toBe(
          'https://trakt.tv/users/vlad/year/2025/?embedded_mode=true&slurm=slurm-token',
        );
      expect(UrlBuilder.og.frame.yearToDate('vlad', '2025', null)).toBe(
        'https://trakt.tv/users/vlad/year/2025/?embedded_mode=true',
      );
    });

    it('builds the month in review frame url', () => {
      expect(UrlBuilder.og.frame.monthInReview('vlad', '2025', '6', 'token'))
        .toBe(
          'https://trakt.tv/users/vlad/mir/2025/6/?embedded_mode=true&slurm=token',
        );
    });
  });

  describe('og support', () => {
    it('falls back to a support email when there is no username', () => {
      const url = UrlBuilder.og.support();

      expect(
        url.startsWith(
          'mailto:support@trakt.tv?subject=Trakt Support Request&body=',
        ),
      ).toBe(true);
      expect(url).toContain(encodeURIComponent('Please describe your issue'));
    });

    it('links to the forums with user details when a username is set', () => {
      const url = UrlBuilder.og.support('vlad');

      expect(
        url.startsWith('https://forums.trakt.tv/new-message?username=support'),
      ).toBe(true);
      expect(url).toContain(encodeURIComponent('**Username:** vlad'));
    });
  });

  describe('external', () => {
    it('builds external provider urls', () => {
      expect(UrlBuilder.external.imdb.person('nm0186505')).toBe(
        'https://www.imdb.com/name/nm0186505',
      );
      expect(UrlBuilder.external.imdb.media('tt0903747')).toBe(
        'https://www.imdb.com/title/tt0903747',
      );
      expect(UrlBuilder.external.tmdb.media('1396', 'tv')).toBe(
        'https://www.themoviedb.org/tv/1396',
      );
      expect(UrlBuilder.external.wikipedia('Breaking_Bad')).toBe(
        'https://en.wikipedia.org/wiki/Breaking_Bad',
      );
    });
  });
});
