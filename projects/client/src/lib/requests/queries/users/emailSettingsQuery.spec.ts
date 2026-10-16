import { describe, expect, it } from 'vitest';
import { mapToEmailSettings } from './emailSettingsQuery.ts';

describe('mapToEmailSettings', () => {
  it('should map the response flags to settings', () => {
    expect(
      mapToEmailSettings({
        notifications: true,
        recaps: false,
        marketing: true,
      }),
    ).toEqual({
      hasNotifications: true,
      hasRecaps: false,
      hasMarketing: true,
    });
  });
});
