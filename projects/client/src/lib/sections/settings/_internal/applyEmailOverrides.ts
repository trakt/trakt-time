import type { EmailCategory } from '$lib/requests/models/EmailCategory.ts';
import type { EmailSettings } from '$lib/requests/models/EmailSettings.ts';

export type EmailOverrides = Readonly<Partial<Record<EmailCategory, boolean>>>;

export function applyEmailOverrides(
  settings: EmailSettings | Nil,
  overrides: EmailOverrides,
): EmailSettings | null {
  if (!settings) return null;

  return {
    hasNotifications: overrides.notifications ?? settings.hasNotifications,
    hasRecaps: overrides.recaps ?? settings.hasRecaps,
    hasMarketing: overrides.marketing ?? settings.hasMarketing,
  };
}
