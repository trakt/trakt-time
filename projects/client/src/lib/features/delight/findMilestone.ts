import { crossedMilestone } from './delightRules.ts';
import type { MilestoneCounts } from './_internal/milestoneBaseline.ts';

export type MilestoneKind = keyof MilestoneCounts;

export const MILESTONES: Readonly<
  Record<MilestoneKind, ReadonlyArray<number>>
> = {
  episodes: [100, 500, 1000],
  movies: [100],
  hours: [1000],
};

export type Milestone = {
  kind: MilestoneKind;
  threshold: number;
  from: number;
  to: number;
};

export function findMilestone(
  { before, after }: { before: MilestoneCounts; after: MilestoneCounts },
): Milestone | null {
  const kinds = Object.keys(MILESTONES) as MilestoneKind[];

  return kinds
    .map((kind) => {
      const threshold = crossedMilestone({
        before: before[kind],
        after: after[kind],
        thresholds: MILESTONES[kind],
      });
      return threshold === null
        ? null
        : { kind, threshold, from: before[kind], to: after[kind] };
    })
    .find((milestone) => milestone !== null) ?? null;
}

export function milestoneBadge(threshold: number): string {
  return threshold >= 1000 ? `${threshold / 1000}K` : `${threshold}`;
}
