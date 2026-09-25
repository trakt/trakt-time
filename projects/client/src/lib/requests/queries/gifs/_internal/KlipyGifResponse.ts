import { z } from 'zod';

const KlipySourceSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const KlipyFormatsSchema = z.object({
  gif: KlipySourceSchema,
  webp: KlipySourceSchema.optional(),
  jpg: KlipySourceSchema.optional(),
});

export const KlipyGifResponseSchema = z.object({
  id: z.union([z.number(), z.string()]),
  slug: z.string(),
  title: z.string(),
  type: z.literal('gif'),
  blur_preview: z.string().nullish(),
  file: z.object({
    md: KlipyFormatsSchema,
    sm: KlipyFormatsSchema,
  }),
});

export type KlipyGifResponse = z.infer<typeof KlipyGifResponseSchema>;
