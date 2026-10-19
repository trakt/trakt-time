import { QueryClient } from '@tanstack/query-core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSearchNavigation,
  NAVIGATION_DEBOUNCE,
  useSearch,
} from './useSearch.ts';

const { client, context, lookupSignals, fetchCalls } = vi.hoisted(() => ({
  client: { current: undefined as unknown },
  context: {
    mode: undefined as unknown,
    isSearching: undefined as unknown,
  },
  lookupSignals: [] as AbortSignal[],
  fetchCalls: [] as { url: string; signal: AbortSignal | undefined }[],
}));

vi.mock('$app/environment', () => ({ browser: true }));

vi.mock('$lib/features/query/_internal/queryClientContext.ts', () => ({
  useQueryClient: () => client.current,
}));

vi.mock('./_internal/getSearchContext.ts', () => ({
  getSearchContext: () => ({
    mode: context.mode,
    isSearching: context.isSearching,
    config: {
      server: 'search.test',
      keys: { media: { default: 'key', exact: 'key' }, people: 'key' },
    },
    pathName: '/discover',
    query: new BehaviorSubject(''),
  }),
}));

vi.mock('../analytics/useTrack.ts', () => ({
  useTrack: () => ({ track: vi.fn() }),
}));

vi.mock('../../requests/search/lookup.ts', () => ({
  lookup: ({ signal }: { signal?: AbortSignal }) => {
    if (signal) lookupSignals.push(signal);

    return new Promise((_, reject) =>
      signal?.addEventListener('abort', () =>
        reject(new Error('Request aborted by caller.')),
      ),
    );
  },
}));

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

const TERM_GAP = 200;
const REQUESTS_PER_TERM = 4;

function stubFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL, init?: RequestInit) => {
      const signal = init?.signal ?? undefined;
      fetchCalls.push({ url: String(input), signal });

      return new Promise((_, reject) =>
        signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        ),
      );
    }),
  );
}

const requestSignals = () => [
  ...lookupSignals,
  ...fetchCalls.flatMap(({ signal }) => (signal ? [signal] : [])),
];

describe('useSearch: replaced terms', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    client.current = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    context.mode = new BehaviorSubject('media');
    context.isSearching = new BehaviorSubject(false);
    lookupSignals.length = 0;
    fetchCalls.length = 0;
    stubFetch();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function typeWord(word: string) {
    const { search, results } = useSearch();
    const error = vi.fn();
    const subscription = results.subscribe({ error });

    for (let length = 1; length <= word.length; length++) {
      search(word.slice(0, length), 'media');
      await vi.advanceTimersByTimeAsync(TERM_GAP);
    }

    return { error, subscription, search };
  }

  it('should leave only the requests of the latest term running', async () => {
    const { subscription } = await typeWord('matrix');

    const running = requestSignals().filter((signal) => !signal.aborted);

    expect(requestSignals()).toHaveLength(6 * REQUESTS_PER_TERM);
    expect(running).toHaveLength(REQUESTS_PER_TERM);

    subscription.unsubscribe();
  });

  it('should not fall back to the API for a lookup that was aborted', async () => {
    const { subscription } = await typeWord('matrix');

    const fallbacks = fetchCalls.filter(
      ({ url }) => !url.includes('recent_by_id'),
    );

    expect(fallbacks).toHaveLength(0);

    subscription.unsubscribe();
  });

  it('should not surface an error for a cancelled term', async () => {
    const { error, subscription } = await typeWord('matrix');

    expect(error).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should abort the running requests when the search is cleared', async () => {
    const { subscription, search } = await typeWord('matrix');

    search('', 'media');
    await vi.advanceTimersByTimeAsync(TERM_GAP);

    expect(requestSignals().filter((signal) => !signal.aborted)).toHaveLength(
      0,
    );

    subscription.unsubscribe();
  });

  it('should not start a second search for the same term', async () => {
    const { search, results } = useSearch();
    const subscription = results.subscribe();

    search('matrix', 'media');
    await vi.advanceTimersByTimeAsync(TERM_GAP);
    search(' Matrix ', 'media');
    await vi.advanceTimersByTimeAsync(TERM_GAP);

    expect(requestSignals()).toHaveLength(REQUESTS_PER_TERM);

    subscription.unsubscribe();
  });
});
