import { zipSync } from 'fflate';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildHistoryPayload } from '../engine/buildHistoryPayload.ts';
import type { UniversalImportItem } from '../ImportTypes.ts';
import { TvTimeCsvParser } from './TvTimeCsvParser.ts';

const FIXTURE_DIR = join(import.meta.dirname, '__fixtures__/tvtime');

function fixture(name: string): string {
  return readFileSync(join(FIXTURE_DIR, name), 'utf-8');
}

function csvFile(fixtureName: string, uploadName = fixtureName): File {
  return new File([fixture(fixtureName)], uploadName, { type: 'text/csv' });
}

function jsonFile(name: string): File {
  return new File([fixture(name)], name, { type: 'application/json' });
}

function tally(items: readonly UniversalImportItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const key = `${item.action}:${item.type}`;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function zipFixtures(names: string[], zipName: string): File {
  const encoder = new TextEncoder();
  const entries = Object.fromEntries(
    names.map((name) => [name, encoder.encode(fixture(name))]),
  );
  return new File([zipSync(entries) as BlobPart], zipName);
}

function zipNamed(
  pairs: ReadonlyArray<[fixtureName: string, entryName: string]>,
  zipName: string,
): File {
  const encoder = new TextEncoder();
  const entries = Object.fromEntries(
    pairs.map(([name, entry]) => [entry, encoder.encode(fixture(name))]),
  );
  return new File([zipSync(entries) as BlobPart], zipName);
}

describe('TvTimeCsvParser: real anonymized exports', () => {
  it('imports a real GDPR v2 tracking file (ep_id episodes + watchlist)', async () => {
    const result = await TvTimeCsvParser.parse([
      csvFile(
        'gdpr-v2-tracking-prod-records-v2.csv',
        'tracking-prod-records-v2.csv',
      ),
    ]);

    expect(tally(result)).toEqual({
      'history:episode': 8,
      'watchlist:show': 1,
    });
    expect(result.every((item) => item.ids.tvdb != null)).toBe(true);
    expect(
      result
        .filter((item) => item.type === 'episode')
        .every((item) => item.showTvdb != null),
    ).toBe(true);
  });

  it('routes real episode watches by their own TVDB id', async () => {
    const result = await TvTimeCsvParser.parse([
      csvFile(
        'gdpr-v2-tracking-prod-records-v2.csv',
        'tracking-prod-records-v2.csv',
      ),
    ]);

    const payload = buildHistoryPayload([...result]);

    expect(payload.episodes).toHaveLength(8);
    expect(
      payload.episodes?.every((episode) =>
        'ids' in episode && episode.ids != null && 'tvdb' in episode.ids
      ),
    ).toBe(true);
    const positionalEpisodes = (payload.shows ?? [])
      .flatMap((show) => ('seasons' in show ? show.seasons ?? [] : []))
      .flatMap((season) => season.episodes ?? []);
    expect(positionalEpisodes).toHaveLength(0);
  });

  it('imports a real current-format export from loose tvtime-*.csv files', async () => {
    const result = await TvTimeCsvParser.parse([
      csvFile('tvtime-series-episodes.csv'),
      csvFile('tvtime-movies.csv'),
      csvFile('tvtime-series.csv'),
    ]);

    expect(tally(result)).toEqual({
      'history:episode': 7,
      'history:movie': 4,
      'watchlist:show': 1,
    });
    expect(result.every((item) => item.ids.tvdb != null)).toBe(true);
  });

  it('imports a real current-format export from a tvtime-export zip', async () => {
    const zip = zipFixtures([
      'tvtime-series-episodes.csv',
      'tvtime-movies.csv',
      'tvtime-series.csv',
    ], 'tvtime-export-2026-07-05.zip');

    const result = await TvTimeCsvParser.parse([zip]);

    expect(tally(result)).toEqual({
      'history:episode': 7,
      'history:movie': 4,
      'watchlist:show': 1,
    });
  });

  it('imports a real current-format export from the JSON serialization', async () => {
    const result = await TvTimeCsvParser.parse([
      jsonFile('tvtime-series.json'),
      jsonFile('tvtime-movies.json'),
    ]);

    expect(tally(result)).toEqual({
      'history:episode': 2,
      'history:movie': 3,
    });
    expect(result.every((item) => item.ids.tvdb != null)).toBe(true);
  });

  it('merges a real CSV zip and JSON zip uploaded together', async () => {
    const csvZip = zipFixtures(
      ['tvtime-series-episodes.csv', 'tvtime-movies.csv'],
      'tvtime-export-2026-07-05 (1).zip',
    );
    const jsonZip = zipFixtures(
      ['tvtime-series.json', 'tvtime-movies.json'],
      'tvtime-export-2026-07-05 (2).zip',
    );

    const result = await TvTimeCsvParser.parse([csvZip, jsonZip]);

    expect(tally(result)).toEqual({
      'history:episode': 9,
      'history:movie': 7,
    });
    expect(result.every((item) => item.ids.tvdb != null)).toBe(true);
  });

  it('imports custom lists from a real tvtime-lists export', async () => {
    const result = await TvTimeCsvParser.parse([csvFile('tvtime-lists.csv')]);

    expect(tally(result)).toEqual({ 'list:show': 10 });
    expect(result.every((item) => item.listName === 'LIKE')).toBe(true);
    expect(result.every((item) => item.ids.tvdb != null)).toBe(true);
  });

  it('imports custom lists from a real GDPR zip alongside tracking data', async () => {
    const zip = zipNamed([
      ['gdpr-v2-tracking-prod-records-v2.csv', 'tracking-prod-records-v2.csv'],
      ['gdpr-lists-prod-lists.csv', 'lists-prod-lists.csv'],
    ], 'gdpr-data.zip');

    const result = await TvTimeCsvParser.parse([zip]);

    const t = tally(result);
    expect(t['history:episode']).toBe(8);
    expect(t['list:show']).toBe(8);
    expect(
      result.filter((i) => i.action === 'list').every((i) =>
        i.listName != null && i.ids.tvdb != null
      ),
    ).toBe(true);
  });
});
