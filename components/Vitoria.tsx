"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import type { Resultado } from "@/lib/conta";
import { cenarioDaDisputa, parDaDisputa, quemLidera } from "@/lib/placar";
import { primeiroNome } from "@/components/DisputaVisual";

const COR = { azul: "#1d4e89", vermelho: "#9f2d2d" };

export function Vitoria({ resultado }: { resultado: Resultado | null }) {
  const { copy } = useI18n();
  const [mostrar, setMostrar] = useState(false);
  const par = resultado ? parDaDisputa(resultado.candidatos) : null;
  const cenario = resultado && par ? cenarioDaDisputa(par, resultado) : null;
  const lider = cenario?.tipo === "eleito" && par ? quemLidera(par) : null;
  const chave = lider && resultado ? `${resultado.cargo}:${resultado.uf}:${lider.sqcand}` : "";
  const lado = lider && par && lider.sqcand === par.vermelho.sqcand ? "vermelho" : "azul";
  const cor = COR[lado];
  const foto = lider?.fotos.find((url) => url.startsWith("https://resultados.tse.jus.br/")) ?? "";

  useEffect(() => {
    if (!chave) {
      setMostrar(false);
      return;
    }
    setMostrar(window.sessionStorage.getItem("vitoria") !== chave);
  }, [chave]);

  if (!mostrar || !lider) return null;

  function fechar() {
    window.sessionStorage.setItem("vitoria", chave);
    setMostrar(false);
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={copy.vitoria(primeiroNome(lider.nome))}>
      <div className="absolute inset-0" style={{ background: cor }} />
      {foto && <img src={foto} alt={copy.fotoAlt(lider.nome)} className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 text-white sm:p-10">
        <p className="font-serif text-5xl leading-none sm:text-7xl">{copy.vitoria(primeiroNome(lider.nome))}</p>
        <p className="max-w-xl text-lg">{copy.cenarioEleito(primeiroNome(lider.nome))}</p>
        <button type="button" className="min-h-11 rounded-full border border-white px-4 text-sm" onClick={fechar}>
          {copy.fechar}
        </button>
      </div>
    </div>
  );
}
