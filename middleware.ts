import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeFromAccept, localeFromCountry } from "@/lib/locale";

export function middleware(request: NextRequest) {
  const salvo = request.cookies.get("locale")?.value;
  const pais = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry");
  const locale = isLocale(salvo) ? salvo : (localeFromCountry(pais) ?? localeFromAccept(request.headers.get("accept-language")));
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-locale", locale);
  const resposta = NextResponse.next({ request: { headers: cabecalhos } });
  if (salvo !== locale) {
    resposta.cookies.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return resposta;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg).*)"],
};
