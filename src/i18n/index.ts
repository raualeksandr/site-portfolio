import en from "./en.json";
import ru from "./ru.json";

export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries = { en, ru } satisfies Record<Locale, unknown>;

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Derive the current locale from a request URL (`/ru/...` -> `ru`). */
export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  return lang && isLocale(lang) ? lang : defaultLocale;
}

/** Look up a dot-notation key (`"home.heading"`) in a locale's dictionary. */
export function useTranslations(lang: Locale) {
  const dict = dictionaries[lang];

  return function t(key: string, vars?: Record<string, string>): string {
    const value = key
      .split(".")
      .reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], dict);

    if (typeof value !== "string") {
      throw new Error(`Missing i18n key "${key}" for locale "${lang}"`);
    }

    if (!vars) return value;
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? "");
  };
}

/** Same path, other locale — swaps the leading `/en/`/`/ru/` segment and keeps the rest. */
export function getLocalizedPath(url: URL, lang: Locale): string {
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = lang;
  } else {
    segments.unshift(lang);
  }

  return `/${segments.join("/")}/`;
}
