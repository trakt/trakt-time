import { useTrack } from '$lib/features/analytics/useTrack.ts';
import { AnalyticsEvent } from '$lib/features/analytics/events/AnalyticsEvent.ts';
import { useUser } from '$lib/features/auth/stores/useUser.ts';
import { FeatureFlag } from '$lib/features/feature-flag/models/FeatureFlag.ts';
import { useFeatureFlag } from '$lib/features/feature-flag/useFeatureFlag.ts';
import { firstValueFrom } from 'rxjs';
import { createDelightMemory } from './_internal/createDelightMemory.ts';
import { bucketFor, shouldFire } from './delightRules.ts';
import type { DelightKind } from './models/DelightKind.ts';

const DEFAULT_VARIANT = 'default';

let memory: ReturnType<typeof createDelightMemory> | null = null;

type ClaimParams<T extends string> = {
  onceKey?: string;
  variants?: ReadonlyArray<T>;
};

export function useDelight(kind: DelightKind) {
  const { isEnabled } = useFeatureFlag(FeatureFlag.Delighters);
  const { track } = useTrack(AnalyticsEvent.DelighterShown);
  const { user } = useUser();

  async function claim<T extends string = typeof DEFAULT_VARIANT>(
    { onceKey, variants }: ClaimParams<T> = {},
  ): Promise<T | null> {
    if (!(await firstValueFrom(isEnabled))) return null;

    memory ??= createDelightMemory();
    const scopedKey = onceKey ? `${kind}:${onceKey}` : undefined;
    if (!shouldFire({ onceKey: scopedKey, fired: memory.fired() })) return null;
    if (scopedKey) memory.remember(scopedKey);

    const currentUser = await firstValueFrom(user);
    const variant = variants
      ? bucketFor({
        seed: currentUser?.slug || 'anonymous',
        experiment: kind,
        variants,
      })
      : DEFAULT_VARIANT as T;

    if (variants) track({ id: kind, variant });
    return variant;
  }

  return { claim };
}
