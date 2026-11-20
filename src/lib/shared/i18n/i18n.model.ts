// The UI language. Picked in Account → Language, otherwise the browser's own, otherwise English.
//
// Kept on the device (localStorage) like the accent colour. Only the app's own words are
// translated — names and descriptions from the catalog stay in whatever language they were
// written in, and the SEO copy baked at build time (shared/seo) stays English.
import { createEffect, createEvent, createStore, sample } from "effector";

export const LOCALES = {
  en: "English",
  ru: "Русский",
  uk: "Українська",
  es: "Español",
  hi: "हिन्दी",
} as const;
export type Locale = keyof typeof LOCALES;

const STORAGE_KEY = "fmc:locale";
const isLocale = (v: unknown): v is Locale => typeof v === "string" && v in LOCALES;

const initial = (): Locale => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // storage blocked — fall through to the browser's languages
  }
  if (typeof navigator === "undefined") return "en";
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return "en";
};

// ---- stores ----
export const $locale = createStore<Locale>(initial());

// ---- events ----
export const localePicked = createEvent<string>();

// ---- effects ----
const applyLocaleFx = createEffect((locale: Locale) => {
  document.documentElement.lang = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // still applies for this session
  }
});

// ---- business logic ----
sample({
  clock: localePicked,
  filter: isLocale,
  target: $locale,
});
sample({
  clock: $locale,
  target: applyLocaleFx,
});

if (typeof document !== "undefined") document.documentElement.lang = $locale.defaultState;

/**
 * A module's dictionary: English is the shape, every other language must fill all of it (a
 * missing key is a type error). Values are strings, or functions for anything with a number or
 * a name in it. Components read it as a store: `$t.download`, `$t.faces(n)`.
 */
export const dict = <T extends Record<string, unknown>>(
  en: T,
  rest: Record<Exclude<Locale, "en">, NoInfer<T>>,
) => {
  const all: Record<Locale, T> = { en, ...rest };

  return $locale.map((l) => all[l]);
};

const rules = new Map<Locale, Intl.PluralRules>();
/** `plural("ru", n, { one: "циферблат", few: "циферблата", many: "циферблатов" })` */
export const plural = (
  locale: Locale,
  n: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other?: string },
): string => {
  let r = rules.get(locale);

  if (!r) rules.set(locale, (r = new Intl.PluralRules(locale)));
  return forms[r.select(n)] ?? forms.other ?? forms.many ?? forms.one ?? "";
};
