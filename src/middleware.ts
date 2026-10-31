import { defineMiddleware } from 'astro:middleware';
import { middleware as i18n } from 'astro:i18n';

// D3 + D10 (see docs/arch-rules.md): the same locale gate Astro applies
// with `prefixDefaultLocale: true`, minus Keystatic's admin, whose
// /keystatic path is hardcoded and can't carry a locale prefix.
const localeGate = i18n({ prefixDefaultLocale: true });

const isKeystatic = (pathname: string) =>
  /^\/(api\/)?keystatic(\/|$)/.test(pathname);

export const onRequest = defineMiddleware((context, next) =>
  isKeystatic(context.url.pathname) ? next() : localeGate(context, next),
);
