"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MENSAGENS, type Copy } from "@/lib/i18n";
import { LOCALES, intlLocale, isLocale, type Locale } from "@/lib/locale";

const Contexto = createContext<{ locale: Locale; copy: Copy; definir: (locale: Locale) => void } | null>(null);

export function LocaleProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initial);

  useEffect(() => {
    document.documentElement.lang = intlLocale(locale);
  }, [locale]);

  const valor = useMemo(
    () => ({
      locale,
      copy: MENSAGENS[locale],
      definir: (proximo: Locale) => {
        setLocale(proximo);
        document.cookie = `locale=${proximo};path=/;max-age=31536000;samesite=lax`;
      },
    }),
    [locale],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useI18n() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useI18n fora do provider");
  return valor;
}

export function SeletorIdioma() {
  const { locale, copy, definir } = useI18n();
  return (
    <label className="block text-sm">
      <span className="sr-only">{copy.idioma}</span>
      <select
        aria-label={copy.idioma}
        className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--paper)] px-3"
        value={locale}
        onChange={(evento) => {
          if (isLocale(evento.target.value)) definir(evento.target.value);
        }}
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {rotulo(item)}
          </option>
        ))}
      </select>
    </label>
  );
}

function rotulo(locale: Locale): string {
  if (locale === "pt-BR") return "Português (Brasil)";
  if (locale === "pt-PT") return "Português (Portugal)";
  if (locale === "es") return "Español";
  return "English";
}
