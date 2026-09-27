export type RecapWatch = {
  watchedAt: Date;
  minutes: number;
  showTitle: string | null;
  genres: ReadonlyArray<string>;
};

export type MonthRecap = {
  month: Date;
  minutes: number;
  topShow: string | null;
  topGenre: string | null;
};

function mostCommon(values: ReadonlyArray<string>): string | null {
  const counts = values.reduce(
    (acc, value) => acc.set(value, (acc.get(value) ?? 0) + 1),
    new Map<string, number>(),
  );

  return [...counts.entries()]
    .reduce<[string, number] | null>(
      (best, entry) => entry[1] > (best?.[1] ?? 0) ? entry : best,
      null,
    )?.[0] ?? null;
}

export function toMonthRecap(
  { watches, now }: { watches: ReadonlyArray<RecapWatch>; now: Date },
): MonthRecap {
  const month = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  const inMonth = watches.filter((watch) =>
    watch.watchedAt >= month && watch.watchedAt < monthEnd
  );

  return {
    month,
    minutes: inMonth.reduce((total, watch) => total + watch.minutes, 0),
    topShow: mostCommon(
      inMonth.flatMap((watch) => watch.showTitle ? [watch.showTitle] : []),
    ),
    topGenre: mostCommon(inMonth.flatMap((watch) => watch.genres)),
  };
}
