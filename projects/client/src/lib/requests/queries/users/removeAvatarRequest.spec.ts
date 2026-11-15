import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { removeAvatarRequest } from './removeAvatarRequest.ts';

const URL = 'http://localhost/users/avatar';

const server = setupServer();

describe('removeAvatarRequest', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should report success on a 204', async () => {
    server.use(http.delete(URL, () => new HttpResponse(null, { status: 204 })));

    await expect(removeAvatarRequest()).resolves.toBe(true);
  });

  it('should send a delete without a body', async () => {
    const received = new Promise<Request>((resolve) => {
      server.use(
        http.delete(URL, ({ request }) => {
          resolve(request);
          return new HttpResponse(null, { status: 204 });
        }),
      );
    });

    await removeAvatarRequest();

    const request = await received;
    expect(request.method).toBe('DELETE');
    expect(request.body).toBeNull();
  });

  it('should report failure on a 401', async () => {
    server.use(http.delete(URL, () => new HttpResponse(null, { status: 401 })));

    await expect(removeAvatarRequest()).resolves.toBe(false);
  });

  it('should report failure when the removal never reaches the server', async () => {
    server.use(http.delete(URL, () => HttpResponse.error()));

    await expect(removeAvatarRequest()).resolves.toBe(false);
  });
});
