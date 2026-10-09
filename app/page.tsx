import { Suspense } from "react";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PainelApp } from "@/components/PainelApp";
import { Carregando } from "@/components/Carregando";
import { resolveLocale } from "@/lib/request-locale";

export default async function Page() {
  const locale = await resolveLocale();
  return (
    <LocaleProvider initial={locale}>
      <Suspense fallback={<Carregando />}>
        <PainelApp />
      </Suspense>
    </LocaleProvider>
  );
}
