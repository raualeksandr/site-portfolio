import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/**
 * EN is required; RU falls back to EN when left empty in the CMS (D11).
 * Keystatic writes empty text fields as "" or omits them, so both count
 * as "not filled".
 */
const text = z.string().optional().transform((s) => s?.trim() || undefined);

const localized = z
  .object({ en: z.string().trim().min(1), ru: text })
  .transform(({ en, ru }) => ({ en, ru: ru ?? en }));

/** Optional pair: undefined unless EN is filled. */
const optionalLocalized = z
  .object({ en: text, ru: text })
  .optional()
  .transform((v) => (v?.en ? { en: v.en, ru: v.ru ?? v.en } : undefined));

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z
      .object({
        // EN title — Keystatic slug field, also the source of the URL.
        title: z.string().trim().min(1),
        titleRu: text,
        summary: localized,
        category: z.enum(["ba", "vibecoded"]),
        // "Astro, Python" in the CMS; a YAML list is accepted too.
        tech: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((v) =>
            (Array.isArray(v) ? v : (v ?? "").split(","))
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        links: z
          .array(
            z.object({
              label: z.string(),
              url: z.string().url(),
            }),
          )
          .default([]),
        // image() validates the file exists and gives astro:assets metadata
        // (width/height) for optimized, lazy-loaded <Image>.
        cover: image().optional(),
        gallery: z.array(image()).default([]),
        video: z.string().url().optional(),
        // Keystatic conditional field: { discriminant, value }.
        details: z
          .object({
            discriminant: z.boolean(),
            value: z
              .object({
                role: optionalLocalized,
                period: optionalLocalized,
                problem: optionalLocalized,
                solution: optionalLocalized,
                result: optionalLocalized,
              })
              .nullish(),
          })
          .optional(),
        featured: z.boolean().default(false),
        order: z.number().default(0),
        draft: z.boolean().default(false),
      })
      .transform(({ title, titleRu, details, ...rest }) => ({
        ...rest,
        title: { en: title, ru: titleRu ?? title },
        ...(details?.discriminant ? details.value : {}),
      })),
});

const about = defineCollection({
  loader: file("src/content/about.json"),
  schema: z.object({
    name: localized,
    headline: localized,
    bio: localized,
    avatar: z.string().optional(),
    location: z.string().optional(),
    languages: z.array(z.string()).default([]),
    socials: z
      .object({
        github: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        email: z.string().email().optional(),
        telegram: z.string().url().optional(),
      })
      .default({}),
    resume: z.string().optional(),
    cta: optionalLocalized,
  }),
});

export const collections = { projects, about };
