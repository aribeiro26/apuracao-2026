"use client";

import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import type { Candidato } from "@/lib/conta";
import { corPartido, iniciais, numero, percentual, razao } from "@/lib/format";
import { intlLocale } from "@/lib/locale";

export function CandidatoCard({
  candidato,
  votosValidos,
  votosDoGrupo,
  mostrarComparacao,
}: {
  candidato: Candidato;
  votosValidos: number;
  votosDoGrupo: number;
  mostrarComparacao: boolean;
}) {
  const { copy, locale } = useI18n();
  const idioma = intlLocale(locale);
  const fatia = razao(candidato.votos, votosValidos);
  const entre = razao(candidato.votos, votosDoGrupo);
  const cor = corPartido(candidato.partido);

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-3">
        <Foto nome={candidato.nome} fotos={candidato.fotos} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-2xl leading-tight">{candidato.nome}</p>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold tracking-wide text-white"
              style={{ background: cor }}
            >
              {candidato.partido || copy.semPartido}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {candidato.partidoNome || copy.semPartido}
            {candidato.numero ? ` · ${candidato.numero}` : ""}
          </p>
          {candidato.coligacao ? (
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {copy.coligacao}: {candidato.coligacao}
            </p>
          ) : null}
          {candidato.vice ? (
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {copy.vice} {candidato.vice}
              {candidato.vicePartido ? ` · ${candidato.vicePartido}` : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <p className="font-serif text-4xl tabular-nums tracking-tight sm:text-5xl">{percentual(fatia, 2, idioma)}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {copy.votosNominais(numero(candidato.votos, idioma))}
          {candidato.pctTse ? ` · ${copy.tsePublica(percentual(candidato.pctTse, 2, idioma))}` : ""}
        </p>
      </div>

      <div>
        <div className="relative h-3 overflow-hidden rounded-full bg-[var(--track)]">
          <div className="absolute inset-y-0 left-1/2 w-px bg-[var(--mark)]" title={copy.marca50} />
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, fatia)}%`, background: cor }} />
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">{copy.marca50}</p>
      </div>

      {mostrarComparacao && (
        <p className="rounded-2xl bg-[var(--green-soft)] px-3 py-2 text-sm text-[var(--green)]">
          {copy.soEntre(percentual(entre, 2, idioma))}
        </p>
      )}

      {candidato.situacao && (
        <p className="text-sm">
          {copy.situacao}: <strong>{candidato.situacao}</strong>
        </p>
      )}
    </article>
  );
}

function Foto({ nome, fotos }: { nome: string; fotos: string[] }) {
  const { copy } = useI18n();
  const [indice, setIndice] = useState(0);
  const candidato = fotos[indice];
  const src = candidato?.startsWith("https://resultados.tse.jus.br/") ? candidato : "";
  if (!src) {
    return (
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[var(--track)] text-sm font-semibold">
        {iniciais(nome)}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={copy.fotoAlt(nome)}
      width={64}
      height={64}
      className="h-16 w-16 shrink-0 rounded-full object-cover"
      onError={() => setIndice((atual) => atual + 1)}
    />
  );
}
