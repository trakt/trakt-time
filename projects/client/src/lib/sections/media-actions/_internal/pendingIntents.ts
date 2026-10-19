import { browser } from '$app/environment';
import { useQueryClient } from '$lib/features/query/_internal/queryClientContext.ts';
import { BehaviorSubject, defer, map, type Observable } from 'rxjs';

export type PendingIntent = 'add' | 'remove';

type PendingEntry = {
  subject: BehaviorSubject<PendingIntent | null>;
  owner: symbol | null;
};

type PendingRegistry = Map<string, PendingEntry>;

type PendingIntentsParams = {
  client: object | Nil;
  key: string;
};

const registries = new WeakMap<object, PendingRegistry>();

function registryFor(client: object | Nil): PendingRegistry {
  if (!client) return new Map();

  const existing = registries.get(client);
  if (existing) return existing;

  const created: PendingRegistry = new Map();
  registries.set(client, created);

  return created;
}

function entryFor(registry: PendingRegistry, key: string): PendingEntry {
  const existing = registry.get(key);
  if (existing) return existing;

  const created: PendingEntry = {
    subject: new BehaviorSubject<PendingIntent | null>(null),
    owner: null,
  };
  registry.set(key, created);

  return created;
}

export function pendingIntentsFor({ client, key }: PendingIntentsParams) {
  const registry = registryFor(client);

  const run = async <T>(intent: PendingIntent, task: () => Promise<T>) => {
    const entry = entryFor(registry, key);
    const owner = Symbol(key);
    entry.owner = owner;
    entry.subject.next(intent);

    try {
      return await task();
    } finally {
      // TanStack hands refetched data to observers on a setTimeout(0) tick.
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (entry.owner === owner) {
        entry.owner = null;
        entry.subject.next(null);
        if (!entry.subject.observed) registry.delete(key);
      }
    }
  };

  const intent: Observable<PendingIntent | null> = defer(
    () => entryFor(registry, key).subject,
  );
  const isPending = intent.pipe(map((value) => value !== null));
  const isAdding = intent.pipe(map((value) => value === 'add'));
  const isRemoving = intent.pipe(map((value) => value === 'remove'));

  return { intent, isPending, isAdding, isRemoving, run };
}

export function usePendingIntents(key: string) {
  const client = browser ? useQueryClient() : undefined;

  return pendingIntentsFor({ client, key });
}
