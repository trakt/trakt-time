import type {
  AvailableLanguage,
  AvailableLocale,
} from '$lib/features/i18n/index.ts';
import * as m from '$lib/paraglide/messages.js';
import type { MediaEntry } from '$lib/requests/models/MediaEntry.ts';
import type { ShowEnding } from '$lib/requests/models/ShowEntry.ts';
import { toHumanDay } from '$lib/utils/formatting/date/toHumanDay.ts';
import { toHumanDuration } from '$lib/utils/formatting/date/toHumanDuration.ts';
import { toCountryName } from '$lib/utils/formatting/intl/toCountryName.ts';
import { toLanguageName } from '$lib/utils/formatting/intl/toLanguageName.ts';

export type MediaDetail = {
  label: string;
  value: string;
};

type ToMediaDetailsParams = {
  media: Pick<MediaEntry, 'runtime' | 'country' | 'languages'>;
  releaseDate: Date | Nil;
  network?: string | Nil;
  ending?: ShowEnding | Nil;
  locale: AvailableLocale;
  language: AvailableLanguage;
};

const ENDING_LABELS: Record<ShowEnding, () => string> = {
  concluded: m.translated_value_ending_complete,
  open: m.translated_value_ending_unresolved,
};

export function toMediaDetails({
  media,
  releaseDate,
  network,
  ending,
  locale,
  language,
}: ToMediaDetailsParams): MediaDetail[] {
  const firstLanguage = media.languages?.at(0);

  const details: Array<MediaDetail | null> = [
    network ? { label: m.header_network(), value: network } : null,
    releaseDate
      ? {
          label: m.header_release_date(),
          value: toHumanDay({ date: releaseDate, locale, format: 'short' }),
        }
      : null,
    ending
      ? { label: m.header_ending(), value: ENDING_LABELS[ending]() }
      : null,
    media.runtime > 0
      ? {
          label: m.header_runtime(),
          value: toHumanDuration({ minutes: media.runtime }, language),
        }
      : null,
    media.country
      ? {
          label: m.header_country(),
          value: toCountryName(media.country, language),
        }
      : null,
    firstLanguage
      ? {
          label: m.text_language(),
          value: toLanguageName(firstLanguage, language),
        }
      : null,
  ];

  return details.filter((detail): detail is MediaDetail => detail != null);
}
