import { FeatureFlag } from '$lib/features/feature-flag/models/FeatureFlag.ts';
import { useFeatureFlag } from '$lib/features/feature-flag/useFeatureFlag.ts';
import { firstValueFrom } from 'rxjs';
import { createDelightMemory } from './_internal/createDelightMemory.ts';
import { shouldFire } from './delightRules.ts';
import type { DelightKind } from './models/DelightKind.ts';

let memory: ReturnType<typeof createDelightMemory> | null = null;

export function useDelight(kind: DelightKind) {
  const { isEnabled } = useFeatureFlag(FeatureFlag.Delighters);

  async function claim({ onceKey }: { onceKey?: string } = {}) {
    if (!(await firstValueFrom(isEnabled))) return false;

    memory ??= createDelightMemory();
    const scopedKey = onceKey ? `${kind}:${onceKey}` : undefined;
    if (!shouldFire({ onceKey: scopedKey, fired: memory.fired() })) {
      return false;
    }
    if (scopedKey) memory.remember(scopedKey);

    return true;
  }

  function isFresh(onceKey: string): boolean {
    memory ??= createDelightMemory();
    return shouldFire({ onceKey: `${kind}:${onceKey}`, fired: memory.fired() });
  }

  return { claim, isFresh, isEnabled };
}
