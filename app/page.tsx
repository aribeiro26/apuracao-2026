import { Suspense } from "react";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PainelApp } from "@/components/PainelApp";
import { Carregando } from "@/components/Carregando";
import { resolveLocale } from "@/lib/request-locale";
import { resolveTema } from "@/lib/request-tema";

export default async function Page() {
  const locale = await resolveLocale();
  const tema = await resolveTema();
  return (
    <LocaleProvider initial={locale} temaInicial={tema}>
      <Suspense fallback={<Carregando />}>
        <PainelApp />
      </Suspense>
    </LocaleProvider>
  );
}
