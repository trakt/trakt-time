import { api } from '$lib/requests/api.ts';
import { describe, expect, it, vi } from 'vitest';
import { uploadAvatarRequest } from './uploadAvatarRequest.ts';

vi.mock('$lib/requests/api.ts', () => ({ api: vi.fn() }));

const params = { avatar: 'data:image/png;base64,' };

function stubAvatar(avatar: () => Promise<{ status: number }>) {
  vi.mocked(api).mockReturnValue({ users: { avatar } } as never);
}

describe('uploadAvatarRequest', () => {
  it('should report success on a 204', async () => {
    stubAvatar(() => Promise.resolve({ status: 204 }));

    await expect(uploadAvatarRequest(params)).resolves.toBe(true);
  });

  it('should report failure on a 400', async () => {
    stubAvatar(() => Promise.resolve({ status: 400 }));

    await expect(uploadAvatarRequest(params)).resolves.toBe(false);
  });

  it('should report failure when the upload never reaches the server', async () => {
    stubAvatar(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(uploadAvatarRequest(params)).resolves.toBe(false);
  });
});
