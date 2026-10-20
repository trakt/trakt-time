import { saveEmailSettingsRequest } from '$lib/requests/queries/users/saveEmailSettingsRequest.ts';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEmailSettings } from './useEmailSettings.ts';

const { query, invalidate, track } = vi.hoisted(() => ({
  query: { value: null as unknown },
  invalidate: vi.fn(),
  track: vi.fn(),
}));

vi.mock('$lib/features/query/useQuery.ts', () => ({
  useQuery: () => query.value,
}));
vi.mock('$lib/stores/useInvalidator.ts', () => ({
  useInvalidator: () => ({ invalidate }),
}));
vi.mock('$lib/features/analytics/useTrack.ts', () => ({
  useTrack: () => ({ track }),
}));
vi.mock('$lib/requests/queries/users/saveEmailSettingsRequest.ts', () => ({
  saveEmailSettingsRequest: vi.fn(),
}));

const LOADED = {
  hasNotifications: true,
  hasRecaps: false,
  hasMarketing: false,
};

describe('useEmailSettings', () => {
  beforeEach(() => {
    query.value = new BehaviorSubject({ data: LOADED });
    invalidate.mockResolvedValue(undefined);
  });

  it('should stay empty while the settings load', async () => {
    query.value = new BehaviorSubject({ data: undefined });
    const { settings } = useEmailSettings();

    expect(await firstValueFrom(settings)).toBeNull();
  });

  it('should flip the toggle before the request resolves', async () => {
    let resolveSave: (isSaved: boolean) => void = () => undefined;
    vi.mocked(saveEmailSettingsRequest).mockReturnValue(
      new Promise((resolve) => (resolveSave = resolve)),
    );
    const { settings, set } = useEmailSettings();

    const saving = set('recaps', true);

    expect((await firstValueFrom(settings))?.hasRecaps).toBe(true);

    resolveSave(true);
    await saving;
  });

  it('should fall back to the server value when saving fails', async () => {
    vi.mocked(saveEmailSettingsRequest).mockResolvedValue(false);
    const { settings, set } = useEmailSettings();

    await set('recaps', true);

    expect((await firstValueFrom(settings))?.hasRecaps).toBe(false);
    expect(track).not.toHaveBeenCalled();
  });

  it('should track and refresh after a successful save', async () => {
    vi.mocked(saveEmailSettingsRequest).mockResolvedValue(true);
    const { set } = useEmailSettings();

    await set('marketing', true);

    expect(track).toHaveBeenCalledWith({ settings: 'emails_marketing' });
    expect(invalidate).toHaveBeenCalledOnce();
  });
});
