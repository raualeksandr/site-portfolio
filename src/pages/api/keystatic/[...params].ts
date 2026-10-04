// Mounted manually (not via the @keystatic/astro integration) — see
// D10 in docs/arch-rules.md. Endpoint-type routes aren't subject to the
// i18n "page"-only 404 gate, so this one can stay unprefixed.
import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

export const ALL = makeHandler({ config });
export const prerender = false;
