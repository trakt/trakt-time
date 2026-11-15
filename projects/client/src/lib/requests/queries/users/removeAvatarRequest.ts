import { type ApiParams, rawApiFetch } from '$lib/requests/api.ts';

export async function removeAvatarRequest({
  fetch,
}: ApiParams = {}): Promise<boolean> {
  try {
    const { ok } = await rawApiFetch({
      fetch,
      path: '/users/avatar',
      init: { method: 'DELETE' },
    });

    return ok;
  } catch {
    return false;
  }
}
