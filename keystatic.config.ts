import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * EN and RU side by side in one row. EN is the source of truth; RU may be
 * left empty and the site falls back to EN (see content.config.ts).
 */
const localized = (
  label: string,
  opts: { multiline?: boolean; required?: boolean; description?: string } = {},
) =>
  fields.object(
    {
      en: fields.text({
        label: 'EN',
        multiline: opts.multiline,
        validation: { isRequired: opts.required ?? true },
      }),
      ru: fields.text({ label: 'RU', multiline: opts.multiline }),
    },
    { label, description: opts.description, layout: [6, 6] },
  );

const projectImage = (label: string) =>
  // Relative to this entry's own file, matching the "./images/..." paths
  // content.config.ts's image() validator expects.
  fields.image({
    label,
    directory: 'src/content/projects/images',
    publicPath: './images/',
  });

export default config({
  // D10 (see docs/arch-rules.md): local mode while developing on your own
  // machine (writes straight to the filesystem, no GitHub App needed) —
  // production uses GitHub mode so editing the deployed /keystatic page
  // commits to the repo.
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: 'raualeksandr/site-portfolio' },

  ui: {
    brand: { name: 'aleksandrrau.com' },
    navigation: { Content: ['projects'], Profile: ['about'] },
  },

  collections: {
    projects: collection({
      label: 'Projects',
      path: 'src/content/projects/*',
      // D11: the body isn't rendered anywhere, so entries stay .mdx files
      // (the glob loader expects them) without an editor for it.
      format: { contentField: 'content' },
      slugField: 'title',
      columns: ['category'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'In English. The page URL is generated from it.',
          },
          slug: { label: 'URL', description: 'Generated from the title' },
        }),
        titleRu: fields.text({
          label: 'Title (RU)',
          description: 'Leave empty to use the English title',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'BA / PM work', value: 'ba' },
            { label: 'Vibe-coded', value: 'vibecoded' },
          ],
          defaultValue: 'vibecoded',
        }),
        summary: localized('Short description', {
          multiline: true,
          description: 'One or two sentences for the project card',
        }),
        cover: projectImage('Cover image'),
        tech: fields.text({
          label: 'Tech stack',
          description: 'Comma-separated: Astro, Python, Claude API',
        }),
        links: fields.array(
          fields.object(
            {
              label: fields.text({ label: 'Label', validation: { isRequired: true } }),
              url: fields.url({ label: 'URL', validation: { isRequired: true } }),
            },
            { layout: [4, 8] },
          ),
          {
            label: 'Links',
            description: 'GitHub, live demo, article…',
            itemLabel: (props) => props.fields.label.value || 'Link',
          },
        ),
        gallery: fields.array(projectImage('Image'), {
          label: 'Screenshots',
          itemLabel: (props) => props.value?.filename || 'Image',
        }),
        video: fields.url({
          label: 'Video',
          description: 'YouTube or Vimeo link',
          validation: { isRequired: false },
        }),

        // D11: hidden behind a checkbox — most projects only need the
        // fields above.
        details: fields.conditional(
          fields.checkbox({
            label: 'Add case-study details',
            description: 'Role, period, and problem → solution → result',
            defaultValue: false,
          }),
          {
            true: fields.object({
              role: localized('Role', { required: false }),
              period: localized('Period', { required: false }),
              problem: localized('Problem', { multiline: true, required: false }),
              solution: localized('Solution', { multiline: true, required: false }),
              result: localized('Result', { multiline: true, required: false }),
            }),
            false: fields.empty(),
          },
        ),

        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Hidden from the site until unchecked',
          defaultValue: false,
        }),
        order: fields.integer({
          label: 'Order',
          description: 'Lower numbers come first',
          defaultValue: 0,
        }),
        content: fields.emptyContent({ extension: 'mdx' }),
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
