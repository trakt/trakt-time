import type { LeaderboardEntry } from '$lib/requests/models/LeaderboardEntry.ts';

const minutesOf = (entry: LeaderboardEntry) => entry.totalMinutes ?? 0;

function renumber(
  entries: ReadonlyArray<LeaderboardEntry>,
): ReadonlyArray<LeaderboardEntry> {
  return entries.reduce<{ ranked: number; rows: LeaderboardEntry[] }>(
    ({ ranked, rows }, entry) =>
      entry.locked ? { ranked, rows: [...rows, entry] } : {
        ranked: ranked + 1,
        rows: [...rows, { ...entry, rank: ranked + 1 }],
      },
    { ranked: 0, rows: [] },
  ).rows;
}

export function weaveViewer(
  entries: ReadonlyArray<LeaderboardEntry>,
  viewer: LeaderboardEntry | null,
): ReadonlyArray<LeaderboardEntry> {
  if (!viewer) return entries;

  const ownIndex = entries.findIndex((entry) =>
    entry.user.id === viewer.user.id
  );
  if (ownIndex !== -1) {
    return entries.map((entry, index) =>
      index === ownIndex ? { ...entry, isViewer: true } : entry
    );
  }

  const firstBelow = entries.findIndex((entry) =>
    entry.locked || minutesOf(entry) < minutesOf(viewer)
  );
  const insertAt = firstBelow === -1 ? entries.length : firstBelow;

  return renumber([
    ...entries.slice(0, insertAt),
    viewer,
    ...entries.slice(insertAt),
  ]);
}
