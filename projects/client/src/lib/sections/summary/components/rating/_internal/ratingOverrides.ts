import type { ExtendedMediaType } from '$lib/requests/models/ExtendedMediaType.ts';
import { safeLocalStorage } from '$lib/utils/storage/safeStorage.ts';
import { BehaviorSubject } from 'rxjs';
import { z } from 'zod';
import {
  isOverrideFresh,
  type RatingOverride,
  RatingOverrideSchema,
} from './RatingOverride.ts';

const RATING_OVERRIDES_STORAGE_KEY = 'trakt-rating-overrides';

const RatingOverridesSchema = z.record(z.string(), RatingOverrideSchema);
type RatingOverrides = z.infer<typeof RatingOverridesSchema>;

export function ratingOverrideKey(type: ExtendedMediaType, id: number) {
  return `${type}:${id}`;
}

function pruneExpired(overrides: RatingOverrides, now: number) {
  return Object.fromEntries(
    Object.entries(overrides).filter(([, override]) =>
      isOverrideFresh(override, now)
    ),
  );
}

function parseStoredOverrides(raw: string | Nil): RatingOverrides {
  if (!raw) return {};

  try {
    return RatingOverridesSchema.parse(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeOverrides(overrides: RatingOverrides) {
  safeLocalStorage.setItem(
    RATING_OVERRIDES_STORAGE_KEY,
    JSON.stringify(overrides),
  );
}

function readOverrides(): RatingOverrides {
  const stored = parseStoredOverrides(
    safeLocalStorage.getItem(RATING_OVERRIDES_STORAGE_KEY),
  );
  const pruned = pruneExpired(stored, Date.now());
  writeOverrides(pruned);
  return pruned;
}

export const ratingOverrides = new BehaviorSubject<RatingOverrides>(
  readOverrides(),
);

export function setRatingOverride(key: string, override: RatingOverride) {
  const next = {
    ...pruneExpired(ratingOverrides.value, Date.now()),
    [key]: override,
  };
  writeOverrides(next);
  ratingOverrides.next(next);
}
