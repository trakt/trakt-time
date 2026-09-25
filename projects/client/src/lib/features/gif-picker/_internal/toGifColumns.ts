import type { GifEntry } from '$lib/requests/models/GifEntry.ts';

type Layout = {
  columns: GifEntry[][];
  heights: number[];
};

export function toGifColumns(
  gifs: readonly GifEntry[],
  count: number,
): GifEntry[][] {
  if (count < 1) {
    return [];
  }

  const empty: Layout = {
    columns: Array.from({ length: count }, () => []),
    heights: Array.from({ length: count }, () => 0),
  };

  return gifs.reduce((layout, gif) => {
    const shortest = layout.heights.reduce(
      (best, height, index) =>
        height < (layout.heights.at(best) ?? Infinity) ? index : best,
      0,
    );
    const ratio = gif.preview.height / gif.preview.width;

    return {
      columns: layout.columns.map((column, index) =>
        index === shortest ? [...column, gif] : column
      ),
      heights: layout.heights.map((height, index) =>
        index === shortest ? height + ratio : height
      ),
    };
  }, empty).columns;
}
