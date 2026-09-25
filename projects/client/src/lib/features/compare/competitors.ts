import * as m from '$lib/paraglide/messages.js';

export type Competitor = {
  slug: string;
  name: string;
  description: () => string;
  intro: () => string;
  maker: () => string;
  platforms: () => string;
  price: () => string;
  tracks: () => string;
  importsTvTime: boolean;
  history: () => string;
  community: () => string;
  bothAnswer: () => string;
};

export const COMPETITORS: ReadonlyArray<Competitor> = [
  {
    slug: 'bingers',
    name: 'Bingers',
    description: m.compare_bingers_description,
    intro: m.compare_bingers_intro,
    maker: m.compare_bingers_maker_bingers,
    platforms: m.compare_bingers_platforms_bingers,
    price: m.compare_bingers_price_bingers,
    tracks: m.compare_bingers_tracks,
    importsTvTime: true,
    history: m.compare_bingers_history_bingers,
    community: m.compare_bingers_community_bingers,
    bothAnswer: m.compare_faq_both_a,
  },
  {
    slug: 'simkl',
    name: 'Simkl',
    description: m.compare_simkl_description,
    intro: m.compare_simkl_intro,
    maker: m.compare_simkl_maker,
    platforms: m.compare_simkl_platforms,
    price: m.compare_simkl_price,
    tracks: m.compare_simkl_tracks,
    importsTvTime: true,
    history: m.compare_simkl_history,
    community: m.compare_simkl_community,
    bothAnswer: m.compare_faq_both_a,
  },
  {
    slug: 'serializd',
    name: 'Serializd',
    description: m.compare_serializd_description,
    intro: m.compare_serializd_intro,
    maker: m.compare_serializd_maker,
    platforms: m.compare_serializd_platforms,
    price: m.compare_serializd_price,
    tracks: m.compare_serializd_tracks,
    importsTvTime: true,
    history: m.compare_serializd_history,
    community: m.compare_serializd_community,
    bothAnswer: m.compare_faq_both_a,
  },
  {
    slug: 'letterboxd',
    name: 'Letterboxd',
    description: m.compare_letterboxd_description,
    intro: m.compare_letterboxd_intro,
    maker: m.compare_letterboxd_maker,
    platforms: m.compare_letterboxd_platforms,
    price: m.compare_letterboxd_price,
    tracks: m.compare_letterboxd_tracks,
    importsTvTime: false,
    history: m.compare_letterboxd_history,
    community: m.compare_letterboxd_community,
    bothAnswer: m.compare_letterboxd_faq_both_a,
  },
  {
    slug: 'tvmaze',
    name: 'TVmaze',
    description: m.compare_tvmaze_description,
    intro: m.compare_tvmaze_intro,
    maker: m.compare_tvmaze_maker,
    platforms: m.compare_tvmaze_platforms,
    price: m.compare_tvmaze_price,
    tracks: m.compare_tvmaze_tracks,
    importsTvTime: true,
    history: m.compare_tvmaze_history,
    community: m.compare_tvmaze_community,
    bothAnswer: m.compare_faq_both_a,
  },
];

export function findCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((competitor) => competitor.slug === slug);
}
