import { headers } from "next/headers";
import { isLocale, localeFromAccept, localeFromCountry, type Locale } from "./locale";

export async function resolveLocale(): Promise<Locale> {
  const cabecalhos = await headers();
  const definido = cabecalhos.get("x-locale");
  if (isLocale(definido)) return definido;
  const pais = cabecalhos.get("x-vercel-ip-country") || cabecalhos.get("cf-ipcountry");
  return localeFromCountry(pais) ?? localeFromAccept(cabecalhos.get("accept-language"));
}
