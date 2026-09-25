export type JsonLd = Readonly<Record<string, unknown>>;

export type SeoType =
  | 'website'
  | 'video.tv_show'
  | 'video.movie'
  | 'video.episode'
  | 'profile';

export type SeoMeta = {
  title?: Nil | string;
  description?: Nil | string;
  image?: Nil | string;
  imageAlt?: Nil | string;
  type?: SeoType;
  noindex?: boolean;
  canonicalPath?: string;
  jsonLd?: ReadonlyArray<JsonLd>;
};
