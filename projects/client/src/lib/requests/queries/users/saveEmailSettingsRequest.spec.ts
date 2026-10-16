import { rawApiFetch } from '$lib/requests/api.ts';
import { describe, expect, it, vi } from 'vitest';
import { saveEmailSettingsRequest } from './saveEmailSettingsRequest.ts';

vi.mock('$lib/requests/api.ts', () => ({ rawApiFetch: vi.fn() }));

describe('saveEmailSettingsRequest', () => {
  it('should only send the toggled category', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const isSaved = await saveEmailSettingsRequest({
      category: 'recaps',
      enabled: false,
    });

    expect(isSaved).toBe(true);
    expect(rawApiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/users/settings/emails',
        init: expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ recaps: false }),
        }),
      }),
    );
  });

  it('should report a failed save', async () => {
    vi.mocked(rawApiFetch).mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    const isSaved = await saveEmailSettingsRequest({
      category: 'marketing',
      enabled: true,
    });

    expect(isSaved).toBe(false);
  });
});
