export const LOCALES = ["pt-BR", "pt-PT", "es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(valor: string | null | undefined): valor is Locale {
  return LOCALES.includes(valor as Locale);
}

export function intlLocale(locale: Locale): string {
  if (locale === "es") return "es-ES";
  return locale;
}

export function nomeLocale(locale: Locale): string {
  if (locale === "pt-BR") return "Português (Brasil)";
  if (locale === "pt-PT") return "Português (Portugal)";
  if (locale === "es") return "Español";
  return "English";
}

/** País (ISO) visto pelo servidor. Sem país conhecido, o inglês é o padrão. */
export function localeFromCountry(country: string | null | undefined): Locale | null {
  const codigo = (country ?? "").trim().toUpperCase();
  if (codigo === "BR") return "pt-BR";
  if (codigo === "PT") return "pt-PT";
  if (codigo === "ES") return "es";
  if (!codigo || codigo === "XX") return null;
  return "en";
}

export function localeFromAccept(header: string | null | undefined): Locale {
  const partes = (header ?? "")
    .split(",")
    .map((trecho) => trecho.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);
  for (const parte of partes) {
    if (parte === "pt-pt") return "pt-PT";
    if (parte.startsWith("pt")) return "pt-BR";
    if (parte.startsWith("es")) return "es";
    if (parte.startsWith("en")) return "en";
  }
  return "en";
}
