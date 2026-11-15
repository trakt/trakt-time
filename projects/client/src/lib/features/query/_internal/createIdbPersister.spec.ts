import { QueryClient } from '@tanstack/query-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const idb = vi.hoisted(() => ({
  createStore: vi.fn(),
  del: vi.fn(),
  entries: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock('idb-keyval', () => idb);

async function importPersister() {
  vi.resetModules();
  const { createIdbPersister } = await import('./createIdbPersister.ts');
  return createIdbPersister();
}

const DATA_UPDATED_AT = Date.now();

const persistedQuery = {
  buster: 'v3',
  queryHash: '["movie"]',
  queryKey: ['movie'],
  state: { data: { title: 'Heretic' }, dataUpdatedAt: DATA_UPDATED_AT },
  clonedAt: new Date(DATA_UPDATED_AT),
};

const key = `tanstack-query-${persistedQuery.queryHash}`;

describe('util: createIdbPersister', () => {
  beforeEach(() => {
    idb.createStore.mockReturnValue(vi.fn());
    idb.del.mockResolvedValue(undefined);
    idb.entries.mockResolvedValue([]);
    idb.get.mockResolvedValue(undefined);
    idb.set.mockResolvedValue(undefined);
  });

  describe('when storage is available', () => {
    it('should retrieve a stored query', async () => {
      idb.get.mockResolvedValue(persistedQuery);

      const persister = await importPersister();

      await expect(persister.retrieveQuery('["movie"]')).resolves.toEqual(
        persistedQuery.state.data,
      );
    });

    it('should drop a stored query whose dates came back as text', async () => {
      idb.get.mockResolvedValue({
        ...persistedQuery,
        clonedAt: new Date(DATA_UPDATED_AT).toISOString(),
      });

      const persister = await importPersister();

      await expect(
        persister.retrieveQuery('["movie"]'),
      ).resolves.toBeUndefined();
      expect(idb.del).toHaveBeenCalledWith(key, expect.anything());
    });

    it('should drop an entry stored before dates were tracked', async () => {
      const { clonedAt: _clonedAt, ...legacy } = persistedQuery;
      idb.get.mockResolvedValue(legacy);

      const persister = await importPersister();

      await expect(
        persister.retrieveQuery('["movie"]'),
      ).resolves.toBeUndefined();
      expect(idb.del).toHaveBeenCalledWith(key, expect.anything());
    });

    it('should store a real date next to the query', async () => {
      const persister = await importPersister();

      const client = new QueryClient();
      client.setQueryData(['movie'], { title: 'Heretic' });

      await persister.persistQueryByKey(['movie'], client);

      expect(idb.set).toHaveBeenCalledWith(
        key,
        expect.objectContaining({ clonedAt: expect.any(Date) }),
        expect.anything(),
      );
    });
  });
});
