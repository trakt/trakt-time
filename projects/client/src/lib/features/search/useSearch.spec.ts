import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchNavigation, NAVIGATION_DEBOUNCE } from './useSearch.ts';

const KEY_GAP = 50;

function setup(initialUrlTerm = '') {
  const input = { value: initialUrlTerm };
  const url = { term: initialUrlTerm };
  const navigate = vi.fn((term: string) => {
    url.term = term;
  });

  const navigation = createSearchNavigation({
    readValue: () => input.value,
    readUrlTerm: () => url.term,
    navigate,
  });

  const type = (word: string) =>
    word.split('').forEach((character) => {
      input.value += character;
      navigation.input();
      vi.advanceTimersByTime(KEY_GAP);
    });

  return { input, url, navigate, navigation, type };
}

describe('createSearchNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should navigate twice while typing a word on the search page', () => {
    const { navigate, type } = setup();

    type('matrix');
    vi.advanceTimersByTime(NAVIGATION_DEBOUNCE);

    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenNthCalledWith(1, 'm');
    expect(navigate).toHaveBeenLastCalledWith('matrix');
  });

  it('should batch every keystroke into one navigation once results are open', () => {
    const { navigate, type } = setup('m');

    type('atrix');
    expect(navigate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(NAVIGATION_DEBOUNCE);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('matrix');
  });

  it('should navigate at once on the first keystroke', () => {
    const { input, navigate, navigation } = setup();

    input.value = 'm';
    navigation.input();

    expect(navigate).toHaveBeenCalledWith('m');
  });

  it('should navigate at once when the input is emptied', () => {
    const { input, navigate, navigation } = setup('matrix');

    input.value = '';
    navigation.input();

    expect(navigate).toHaveBeenCalledWith('');
  });

  it('should navigate at once and drop the pending navigation on clear', () => {
    const { navigate, navigation, type } = setup('m');

    type('atrix');
    navigation.clear();
    vi.advanceTimersByTime(NAVIGATION_DEBOUNCE);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('');
  });

  it('should navigate with the text typed since the last keystroke', () => {
    const { input, navigate, navigation } = setup('m');

    input.value = 'ma';
    navigation.input();
    input.value = 'matrix';
    vi.advanceTimersByTime(NAVIGATION_DEBOUNCE);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('matrix');
  });

  it('should skip the navigation when the text is back at the URL term', () => {
    const { input, navigate, navigation } = setup('m');

    input.value = 'ma';
    navigation.input();
    input.value = 'm';
    vi.advanceTimersByTime(NAVIGATION_DEBOUNCE);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('should not navigate after being cancelled', () => {
    const { navigate, navigation, type } = setup('m');

    type('atrix');
    navigation.cancel();
    vi.advanceTimersByTime(NAVIGATION_DEBOUNCE);

    expect(navigate).not.toHaveBeenCalled();
  });
});
