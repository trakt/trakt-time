type AggregateRatingParams = {
  rating?: Nil | number;
  votes?: Nil | number;
};

export function toAggregateRating({ rating, votes }: AggregateRatingParams) {
  if (!rating || !votes) return undefined;

  return {
    '@type': 'AggregateRating',
    ratingValue: Math.round(rating * 100) / 10,
    bestRating: 10,
    worstRating: 1,
    ratingCount: votes,
  };
}
