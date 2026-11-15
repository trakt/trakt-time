import { describe, expect, it } from 'vitest';
import { toWatchProgress } from './toWatchProgress.ts';

const show = (plays: Array<[number, number]>, episodeCount: number | null) => ({
  playsPerSeason: new Map(plays),
  episodeCount,
});

describe('toWatchProgress', () => {
  it('is 0 when nothing is watched', () => {
    expect(toWatchProgress([show([], 10)])).toBe(0);
  });

  it('is 0 when there is no history for the show', () => {
    expect(
      toWatchProgress([{ playsPerSeason: undefined, episodeCount: 10 }]),
    ).toBe(0);
  });

  it('is 0 when the total is 0, null or negative', () => {
    expect(toWatchProgress([show([[1, 3]], 0)])).toBe(0);
    expect(toWatchProgress([show([[1, 3]], null)])).toBe(0);
    expect(toWatchProgress([show([[1, 3]], -4)])).toBe(0);
  });

  it('is 0 without shows', () => {
    expect(toWatchProgress([])).toBe(0);
  });

  it('rounds down to 10% steps', () => {
    expect(toWatchProgress([show([[1, 1]], 10)])).toBe(10);
    expect(toWatchProgress([show([[1, 1]], 20)])).toBe(0);
    expect(toWatchProgress([show([[1, 2]], 20)])).toBe(10);
    expect(toWatchProgress([show([[1, 3]], 8)])).toBe(30);
    expect(toWatchProgress([show([[1, 9]], 10)])).toBe(90);
  });

  it('only reaches 100 when every episode is watched', () => {
    expect(toWatchProgress([show([[1, 99]], 100)])).toBe(90);
    expect(toWatchProgress([show([[1, 100]], 100)])).toBe(100);
  });

  it('adds up every regular season', () => {
    expect(
      toWatchProgress([
        show(
          [
            [1, 5],
            [2, 5],
          ],
          20,
        ),
      ]),
    ).toBe(50);
  });

  it('ignores specials', () => {
    expect(toWatchProgress([show([[0, 10]], 10)])).toBe(0);
    expect(
      toWatchProgress([
        show(
          [
            [0, 10],
            [1, 5],
          ],
          10,
        ),
      ]),
    ).toBe(50);
  });

  it('caps at 100 when more is watched than aired', () => {
    expect(toWatchProgress([show([[1, 12]], 10)])).toBe(100);
  });

  it('weighs several shows by their combined episode counts', () => {
    expect(toWatchProgress([show([[1, 10]], 10), show([], 30)])).toBe(20);
  });

  it('does not let one show spill into another', () => {
    expect(toWatchProgress([show([[1, 50]], 10), show([], 10)])).toBe(50);
  });
});
