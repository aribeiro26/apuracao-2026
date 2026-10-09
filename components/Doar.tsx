"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";

export function BotaoDoar() {
  const { copy } = useI18n();
  const [aberto, setAberto] = useState(false);
  const tituloId = useId();

  useEffect(() => {
    if (!aberto) return;
    function fechar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="min-h-11 rounded-full bg-[var(--green)] px-4 text-sm font-medium text-white"
      >
        {copy.doar}
      </button>
      {aberto && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/40 p-4 sm:place-items-center" onClick={() => setAberto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            className="w-full max-w-sm rounded-3xl bg-[var(--paper)] p-5 shadow-card"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={tituloId} className="font-serif text-2xl">
                {copy.doarTitulo}
              </h2>
              <button type="button" className="min-h-11 px-2 text-sm underline" onClick={() => setAberto(false)}>
                {copy.fechar}
              </button>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{copy.doarTexto}</p>
            <QrDoacao />
            <p className="mt-3 text-sm text-[var(--muted)]">{copy.doarValor}</p>
          </div>
        </div>
      )}
    </>
  );
}

function QrDoacao() {
  const { copy } = useI18n();
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    let objeto = "";
    void fetch("/api/pix", { cache: "no-store" })
      .then((resposta) => {
        if (!resposta.ok) throw new Error("pix");
        return resposta.blob();
      })
      .then((blob) => {
        if (!ativo) return;
        objeto = URL.createObjectURL(blob);
        setUrl(objeto);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
      if (objeto) URL.revokeObjectURL(objeto);
    };
  }, []);

  if (erro) return <p className="mt-4 text-sm">{copy.doarErro}</p>;
  if (!url) return <p className="mt-4 text-sm text-[var(--muted)]">{copy.carregando}</p>;
  return <img src={url} alt={copy.doarTitulo} width={360} height={360} className="mx-auto mt-4 h-auto w-full max-w-[280px]" />;
}
