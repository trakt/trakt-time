import * as m from '$lib/paraglide/messages.js';
import type { MediaSocial } from '$lib/requests/models/MediaSocial.ts';
import type { AvailableLanguage } from '$lib/features/i18n/index.ts';
import { toHumanDuration } from '$lib/utils/formatting/date/toHumanDuration.ts';

export function toSocialDetail(
  { entry, locale }: { entry: MediaSocial; locale: AvailableLanguage },
): string {
  const { watched, watchlisted } = entry;

  const watchedPart = watched && (
    watched.minutesWatched
      ? toHumanDuration({ minutes: watched.minutesWatched }, locale)
      : m.tag_text_plays({ number: watched.plays })
  );

  return [
    watchedPart,
    watched?.comment && m.tag_text_reviewed(),
    watchlisted && m.tag_text_watchlisted(),
  ]
    .filter(Boolean)
    .join(' · ');
}
