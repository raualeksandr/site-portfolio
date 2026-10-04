import { config, fields, collection, singleton } from '@keystatic/core';

/** A field group that mirrors content.config.ts's `localized` zod shape. */
const localized = (label: string, opts: { multiline?: boolean; required?: boolean } = {}) =>
  fields.object({
    en: fields.text({
      label: `${label} (EN)`,
      multiline: opts.multiline,
      validation: { isRequired: opts.required ?? true },
    }),
    ru: fields.text({
      label: `${label} (RU)`,
      multiline: opts.multiline,
      validation: { isRequired: opts.required ?? true },
    }),
  });

export default config({
  // D10 (see docs/arch-rules.md): local mode while developing on your own
  // machine (writes straight to the filesystem, no GitHub App needed) —
  // production uses GitHub mode so editing the deployed /keystatic page
  // commits to the repo.
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: 'raualeksandr/site-portfolio' },

  collections: {
    projects: collection({
      label: 'Projects',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      slugField: 'slug',
      schema: {
        slug: fields.slug({ name: { label: 'Title (used for the URL/filename)' } }),
        title: localized('Title'),
        summary: localized('Summary', { multiline: true }),
        problem: localized('Problem', { multiline: true }),
        solution: localized('Solution', { multiline: true }),
        result: localized('Result', { multiline: true }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'BA', value: 'ba' },
            { label: 'Vibe-coded', value: 'vibecoded' },
          ],
          defaultValue: 'ba',
        }),
        role: localized('Role'),
        period: localized('Period'),
        tech: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tech stack',
          itemLabel: (props) => props.value || 'Tag',
        }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            url: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          {
            label: 'Links',
            itemLabel: (props) => props.fields.label.value || 'Link',
          },
        ),
        // Relative to this entry's own file, matching the "./images/..."
        // paths content.config.ts's image() validator already expects.
        cover: fields.image({
          label: 'Cover image',
          directory: 'src/content/projects/images',
          publicPath: './images/',
        }),
        gallery: fields.array(
          fields.image({
            label: 'Image',
            directory: 'src/content/projects/images',
            publicPath: './images/',
          }),
          { label: 'Gallery', itemLabel: (props) => props.value.filename || 'Image' },
        ),
        video: fields.url({ label: 'Video URL (optional)', validation: { isRequired: false } }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.mdx({ label: 'Body (optional)' }),
      },
    }),
  },

  singletons: {
    about: singleton({
      label: 'About',
      path: 'src/content/about',
      format: 'json',
      schema: {
        // Nested under "main" because content.config.ts loads this
        // singleton with Astro's file() loader, which needs an id key
        // even for a single entry.
        main: fields.object({
          name: localized('Name'),
          headline: localized('Headline'),
          bio: localized('Bio', { multiline: true }),
          avatar: fields.text({ label: 'Avatar path', validation: { isRequired: false } }),
          location: fields.text({ label: 'Location', validation: { isRequired: false } }),
          languages: fields.array(fields.text({ label: 'Language' }), {
            label: 'Languages',
            itemLabel: (props) => props.value || 'Language',
          }),
          socials: fields.object({
            github: fields.url({ label: 'GitHub', validation: { isRequired: false } }),
            linkedin: fields.url({ label: 'LinkedIn', validation: { isRequired: false } }),
            email: fields.text({ label: 'Email', validation: { isRequired: false } }),
            telegram: fields.url({ label: 'Telegram', validation: { isRequired: false } }),
          }),
          resume: fields.text({ label: 'Resume path', validation: { isRequired: false } }),
          cta: localized('CTA', { required: false }),
        }),
      },
    }),
  },
});
