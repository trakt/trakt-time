import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { pendingIntentsFor } from './pendingIntents.ts';

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe('pendingIntentsFor', () => {
  it('should expose the intent right away and clear it on success', async () => {
    const pending = pendingIntentsFor({ client: {}, key: 'a' });
    const task = deferred();
    const subscription = pending.intent.subscribe();

    const run = pending.run('add', () => task.promise);
    expect(await firstValueFrom(pending.intent)).toBe('add');
    expect(await firstValueFrom(pending.isPending)).toBe(true);

    task.resolve();
    await run;

    expect(await firstValueFrom(pending.intent)).toBeNull();
    expect(await firstValueFrom(pending.isPending)).toBe(false);
    subscription.unsubscribe();
  });

  it('should keep the intent until refetched data has reached observers', async () => {
    const pending = pendingIntentsFor({ client: {}, key: 'a' });
    const task = deferred();
    const subscription = pending.intent.subscribe();
    const seenAtDelivery: Array<string | null> = [];

    const run = pending.run('add', () => task.promise);
    setTimeout(() => {
      pending.intent
        .subscribe((value) => seenAtDelivery.push(value))
        .unsubscribe();
    }, 0);
    task.resolve();
    await run;

    expect(seenAtDelivery).toEqual(['add']);
    expect(await firstValueFrom(pending.intent)).toBeNull();
    subscription.unsubscribe();
  });

  it('should clear the intent and rethrow when the task throws', async () => {
    const pending = pendingIntentsFor({ client: {}, key: 'a' });
    const subscription = pending.intent.subscribe();

    const run = pending.run('remove', () => Promise.reject(new Error('boom')));
    expect(await firstValueFrom(pending.intent)).toBe('remove');

    await expect(run).rejects.toThrow('boom');
    expect(await firstValueFrom(pending.intent)).toBeNull();
    subscription.unsubscribe();
  });

  it('should survive the hook being created again with the same key', async () => {
    const client = {};
    const first = pendingIntentsFor({ client, key: 'movie:1' });
    const task = deferred();

    const run = first.run('add', () => task.promise);
    const second = pendingIntentsFor({ client, key: 'movie:1' });

    expect(await firstValueFrom(second.intent)).toBe('add');
    expect(await firstValueFrom(second.isPending)).toBe(true);

    task.resolve();
    await run;

    expect(await firstValueFrom(second.intent)).toBeNull();
  });

  it('should notify an observer created before the write started', async () => {
    const client = {};
    const observer = pendingIntentsFor({ client, key: 'movie:1' });
    const intents: Array<string | null> = [];
    const subscription = observer.intent.subscribe((value) =>
      intents.push(value),
    );

    await pendingIntentsFor({ client, key: 'movie:1' }).run('add', () =>
      Promise.resolve(),
    );
    subscription.unsubscribe();

    expect(intents).toEqual([null, 'add', null]);
  });

  it('should not share intents between keys', async () => {
    const client = {};
    const task = deferred();

    const run = pendingIntentsFor({ client, key: 'movie:1' }).run(
      'add',
      () => task.promise,
    );
    const other = pendingIntentsFor({ client, key: 'movie:2' });

    expect(await firstValueFrom(other.intent)).toBeNull();

    task.resolve();
    await run;
  });

  it('should not share intents between two query clients', async () => {
    const task = deferred();

    const run = pendingIntentsFor({ client: {}, key: 'movie:1' }).run(
      'add',
      () => task.promise,
    );
    const other = pendingIntentsFor({ client: {}, key: 'movie:1' });

    expect(await firstValueFrom(other.intent)).toBeNull();

    task.resolve();
    await run;
  });

  it('should not share intents when there is no query client', async () => {
    const task = deferred();

    const run = pendingIntentsFor({ client: undefined, key: 'movie:1' }).run(
      'add',
      () => task.promise,
    );
    const other = pendingIntentsFor({ client: undefined, key: 'movie:1' });

    expect(await firstValueFrom(other.intent)).toBeNull();

    task.resolve();
    await run;
  });

  it('should keep the newer intent when an older write settles first', async () => {
    const pending = pendingIntentsFor({ client: {}, key: 'movie:1' });
    const older = deferred();
    const newer = deferred();

    const olderRun = pending.run('add', () => older.promise);
    const newerRun = pending.run('remove', () => newer.promise);

    older.resolve();
    await olderRun;
    expect(await firstValueFrom(pending.intent)).toBe('remove');

    newer.resolve();
    await newerRun;
    expect(await firstValueFrom(pending.intent)).toBeNull();
  });
});
