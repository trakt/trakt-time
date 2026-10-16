import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { useQuery } from '$lib/features/query/useQuery.ts';
import type { EmailCategory } from '$lib/requests/models/EmailCategory.ts';
import { InvalidateAction } from '$lib/requests/models/InvalidateAction.ts';
import { emailSettingsQuery } from '$lib/requests/queries/users/emailSettingsQuery.ts';
import { saveEmailSettingsRequest } from '$lib/requests/queries/users/saveEmailSettingsRequest.ts';
import { useInvalidator } from '$lib/stores/useInvalidator.ts';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import {
  applyEmailOverrides,
  type EmailOverrides,
} from './applyEmailOverrides.ts';

export function useEmailSettings() {
  const query = useQuery(emailSettingsQuery());
  const { track } = useTrack(AnalyticsEvent.Settings);
  const { invalidate } = useInvalidator();

  const overrides = new BehaviorSubject<EmailOverrides>({});
  const saving = new Set<EmailCategory>();

  const setOverride = (category: EmailCategory, enabled: boolean) =>
    overrides.next({ ...overrides.value, [category]: enabled });

  const clearOverride = (category: EmailCategory, enabled: boolean) => {
    if (overrides.value[category] !== enabled) return;

    const { [category]: _, ...rest } = overrides.value;
    overrides.next(rest);
  };

  const set = async (category: EmailCategory, enabled: boolean) => {
    if (saving.has(category)) return;

    saving.add(category);
    setOverride(category, enabled);

    const isSaved = await saveEmailSettingsRequest({ category, enabled });
    if (isSaved) {
      track({ settings: `emails_${category}` });
    }

    await invalidate(InvalidateAction.User.EmailSettings);
    clearOverride(category, enabled);
    saving.delete(category);
  };

  return {
    settings: combineLatest([query, overrides]).pipe(
      map(([$query, $overrides]) =>
        applyEmailOverrides($query.data, $overrides)
      ),
    ),
    set,
  };
}
