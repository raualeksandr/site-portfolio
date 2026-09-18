import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/** A field that must be filled in for both site languages. */
const localized = z.object({
  en: z.string(),
  ru: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: localized,
    summary: localized,
    problem: localized,
    solution: localized,
    result: localized,
    category: z.enum(["ba", "vibecoded"]),
    role: localized,
    period: localized,
    tech: z.array(z.string()).default([]),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
    // Plain paths for now — astro:assets optimization lands in Day 5.
    cover: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    video: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
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
    cta: localized.optional(),
  }),
});

export const collections = { projects, about };
