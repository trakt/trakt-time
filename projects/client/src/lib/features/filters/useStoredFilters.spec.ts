import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStoredFiltersStore } from './useStoredFilters.ts';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/') } }));

const KEY = 'test-filters';
const INITIAL = { genres: 'drama' };

describe('createStoredFiltersStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start from the stored filters', async () => {
    localStorage.setItem(KEY, JSON.stringify({ genres: 'comedy' }));

    const { filters } = createStoredFiltersStore(KEY, INITIAL);

    await expect(firstValueFrom(filters)).resolves.toEqual({
      genres: 'comedy',
    });
  });

  it('should start from the defaults when nothing is stored', async () => {
    const { filters } = createStoredFiltersStore(KEY, INITIAL);

    await expect(firstValueFrom(filters)).resolves.toEqual(INITIAL);
  });

  it('should start from the defaults when the stored value is corrupt', async () => {
    localStorage.setItem(KEY, '{not json');

    const { filters } = createStoredFiltersStore(KEY, INITIAL);

    await expect(firstValueFrom(filters)).resolves.toEqual(INITIAL);
  });
});
