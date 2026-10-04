// Split into its own module so `Keystatic` is a real, statically
// importable export — `client:only` hydration needs to trace the
// component back to a module specifier, which a local frontmatter
// const in the .astro file can't provide.
import { makePage } from '@keystatic/astro/ui';
import config from '../../../../keystatic.config';

export const Keystatic = makePage(config);
