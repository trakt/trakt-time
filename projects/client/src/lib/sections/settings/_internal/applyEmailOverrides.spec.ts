import { describe, expect, it } from 'vitest';
import { applyEmailOverrides } from './applyEmailOverrides.ts';

const SETTINGS = {
  hasNotifications: true,
  hasRecaps: false,
  hasMarketing: false,
};

describe('util: applyEmailOverrides', () => {
  it('should stay empty while the settings are loading', () => {
    expect(applyEmailOverrides(undefined, { recaps: true })).toBeNull();
    expect(applyEmailOverrides(null, {})).toBeNull();
  });

  it('should return the settings untouched without overrides', () => {
    expect(applyEmailOverrides(SETTINGS, {})).toEqual(SETTINGS);
  });

  it('should apply an override on top of the loaded value', () => {
    expect(
      applyEmailOverrides(SETTINGS, { recaps: true, notifications: false }),
    ).toEqual({
      hasNotifications: false,
      hasRecaps: true,
      hasMarketing: false,
    });
  });
});
