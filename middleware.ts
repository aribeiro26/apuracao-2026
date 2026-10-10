import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeFromAccept, localeFromCountry } from "@/lib/locale";
import { temaDe } from "@/lib/tema";
import { contextoDe, registrar } from "@/lib/siem";

function politica(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-inline'" : ""}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: https://resultados.tse.jus.br",
    "font-src 'self'",
    "connect-src 'self' https://resultados.tse.jus.br",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(process.env.NODE_ENV === "production" ? ["frame-ancestors 'none'"] : []),
    "frame-src 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
  ].join("; ");
}

function htmlNaUrl(request: NextRequest): boolean {
  const texto = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (/[<>]|javascript:|vbscript:|data:/i.test(texto)) return true;
  for (const [chave, valor] of request.nextUrl.searchParams) {
    if (/[<>]|javascript:|vbscript:|data:/i.test(`${chave}=${valor}`)) return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const ctx = contextoDe(request.headers);
  const nonce = crypto.randomUUID();
  const csp = politica(nonce);
  const salvo = request.cookies.get("locale")?.value;
  const hl = request.nextUrl.searchParams.get("hl");
  const pais = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry");
  const locale = isLocale(hl) ? hl : isLocale(salvo) ? salvo : (localeFromCountry(pais) ?? localeFromAccept(request.headers.get("accept-language")));

  if (htmlNaUrl(request)) {
    registrar({ ...ctx, acao: "http", resultado: "falha", porque: "html-na-url", canal: "http" });
    return new NextResponse("pedido recusado", {
      status: 400,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-security-policy": csp,
        "x-rastreio": ctx.rastreio,
        "x-content-type-options": "nosniff",
      },
    });
  }

  const tema = temaDe(request.cookies.get("tema")?.value);
  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-locale", locale);
  cabecalhos.set("x-tema", tema);
  cabecalhos.set("x-rastreio", ctx.rastreio);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("content-security-policy", csp);
  const resposta = NextResponse.next({ request: { headers: cabecalhos } });
  resposta.headers.set("content-security-policy", csp);
  resposta.headers.set("x-rastreio", ctx.rastreio);
  if (salvo !== locale) {
    resposta.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }

  const postDeAcao = request.method === "POST" && request.headers.has("next-action");
  if (!postDeAcao) {
    registrar({
      ...ctx,
      locale,
      acao: request.method === "GET" || request.method === "HEAD" ? "pagina" : "http",
      resultado: "sucesso",
      porque: "acesso",
      canal: "http",
    });
  }
  return resposta;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|robots.txt|sitemap.xml|opengraph-image).*)"],
};
