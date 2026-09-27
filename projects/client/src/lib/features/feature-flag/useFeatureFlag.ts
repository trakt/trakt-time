import { getContext } from 'svelte';
import { map, of } from 'rxjs';
import type { FeatureFlagContext } from './_internal/FeatureFlagContext.ts';
import { FEATURE_FLAG_CONTEXT_KEY } from './_internal/FeatureFlagContextKey.ts';
import type { FeatureFlag } from './models/FeatureFlag.ts';

export function useFeatureFlag(flag: FeatureFlag) {
  const context = getContext<FeatureFlagContext | undefined>(
    FEATURE_FLAG_CONTEXT_KEY,
  );

  return {
    isEnabled: context
      ? context.flags.pipe(map((flags) => flags[flag]))
      : of(false),
  };
}
