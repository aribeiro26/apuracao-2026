"use client";

import { useState } from "react";
import type { Candidato } from "@/lib/conta";
import { acharDossie, type Bloco, type Item } from "@/lib/dossie";
import { numero, percentual } from "@/lib/format";
import { parDaDisputa } from "@/lib/placar";

const PERGUNTAS: { id: Bloco; rotulo: string }[] = [
  { id: "feitos", rotulo: "O que o candidato já fez" },
  { id: "acusacoes", rotulo: "Do que está sendo acusado" },
  { id: "checagens", rotulo: "Fake news" },
  { id: "pendencias", rotulo: "O que fez e o que deixou de fazer" },
];

function linhaTse(candidato: Candidato, validos: number, idioma: string) {
  const pct = validos > 0 ? percentual((candidato.votos / validos) * 100, 2, idioma) : percentual(0, 2, idioma);
  const situacao = candidato.situacao && candidato.situacao !== "—" ? candidato.situacao : "sem condenação eleitoral neste arquivo";
  return `${candidato.nome} · ${candidato.partido || "sem partido"} · ${candidato.numero || "s/n"}. Situação no TSE: ${situacao}. ${numero(candidato.votos, idioma)} votos (${pct} dos válidos).`;
}

function Lista({ itens }: { itens: Item[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {itens.map((item) => (
        <li key={item.texto} className="text-sm leading-relaxed">
          {item.texto}{" "}
          {item.url ? (
            <a className="underline" href={item.url} target="_blank" rel="noreferrer">
              {item.fonte}
            </a>
          ) : (
            <span className="text-[var(--muted)]">{item.fonte}.</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Perguntas({ candidatos, validos, idioma }: { candidatos: Candidato[]; validos: number; idioma: string }) {
  const [bloco, setBloco] = useState<Bloco>("feitos");
  const par = parDaDisputa(candidatos);
  const nomes = par ? [par.azul, par.vermelho] : candidatos.slice(0, 2);
  const comDados = nomes.flatMap((candidato) => {
    const dossie = acharDossie(`${candidato.nome} ${candidato.nomeCompleto ?? ""}`);
    return dossie ? [{ candidato, dossie }] : [];
  });
  const titulo = nomes.map((candidato) => candidato.nome).join(" e ") || "os candidatos desta tela";

  return (
    <section className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5" aria-label="Perguntas frequentes">
      <h2 className="font-serif text-3xl">Perguntas frequentes</h2>
      <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
        A resposta vale para quem está nesta tela. O voto é o do TSE. O resto é registro público, com fonte. Acusação não é condenação.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Escolha uma pergunta para ler a resposta.">
        {PERGUNTAS.map((pergunta) => (
          <button
            key={pergunta.id}
            type="button"
            aria-pressed={bloco === pergunta.id}
            className={`min-h-11 rounded-full px-3 text-left text-sm ${bloco === pergunta.id ? "bg-[var(--ink)] text-[var(--paper)]" : "border border-[var(--line)]"}`}
            onClick={() => setBloco(pergunta.id)}
          >
            {pergunta.rotulo}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed" role="status" aria-live="polite">
        {comDados.length === 0 ? (
          <p>Ainda não há dossiê consolidado para {titulo}. Abaixo fica só o que o TSE já totalizou. Esta página não inventa biografia.</p>
        ) : (
          comDados.map(({ candidato, dossie }) => (
            <div key={dossie.id} className="mt-4 first:mt-0">
              <p className="font-medium">{candidato.nome}</p>
              <Lista itens={dossie.itens[bloco]} />
            </div>
          ))
        )}
        <div className="mt-4 space-y-1 border-t border-[var(--line)] pt-3 text-[var(--muted)]">
          {nomes.map((candidato) => (
            <p key={candidato.sqcand || candidato.nome}>{linhaTse(candidato, validos, idioma)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
