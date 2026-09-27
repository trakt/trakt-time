import { time } from '$lib/utils/timing/time.ts';
import { z } from 'zod';

export const RATING_OVERRIDE_TTL = time.hours(1);

export const RatingOverrideSchema = z.object({
  rating: z.number().nullable(),
  savedAt: z.number(),
});
export type RatingOverride = z.infer<typeof RatingOverrideSchema>;

export function isOverrideFresh(override: RatingOverride, now: number) {
  return now - override.savedAt < RATING_OVERRIDE_TTL;
}
