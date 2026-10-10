"use client";

import { useEffect, useState } from "react";
import { carregarPainel } from "@/app/acoes";
import { Acompanhar } from "@/components/Acompanhar";
import { Apresentador } from "@/components/Apresentador";
import { primeiroNome, textoDaFrente } from "@/components/DisputaVisual";
import { LocaleProvider } from "@/components/LocaleProvider";
import { usePresenca } from "@/components/Presenca";
import { useI18n } from "@/components/LocaleProvider";
import type { Resultado } from "@/lib/conta";
import { intlLocale, type Locale } from "@/lib/locale";
import { montarPerguntas } from "@/lib/perguntas-apresentador";
import { cenarioDaDisputa, contarLados, eleitosDaApuracao, parDaDisputa, quemLidera } from "@/lib/placar";
import type { Tema } from "@/lib/tema";

export function ApresentadoraGlobal({ locale, tema }: { locale: Locale; tema: Tema }) {
  return (
    <LocaleProvider initial={locale} temaInicial={tema}>
      <Acompanhar />
      <QuandoFaltar />
    </LocaleProvider>
  );
}

function QuandoFaltar() {
  const { tem } = usePresenca();
  const { copy, locale } = useI18n();
  const [painel, setPainel] = useState<{ presidente: Resultado; somaEstados: Resultado; unidades: Resultado[]; governadores: Resultado[] } | null>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto || tem) return;
    let ativo = true;
    void carregarPainel().then((json) => {
      if (ativo && json.ok) setPainel(json);
    }).catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [pronto, tem]);

  if (!pronto || tem || !painel) return null;
  const nacional = painel.somaEstados.candidatos.length ? painel.somaEstados : painel.presidente;
  const par = parDaDisputa(nacional.candidatos);
  const idioma = intlLocale(locale);
  const falas = !par
    ? [copy.semDisputa]
    : [
        textoDaFrente(par, nacional, copy, idioma),
        copy.estadosNaFrente(primeiroNome(par.azul.nome), contarLados(par, painel.unidades).azul),
        copy.estadosNaFrente(primeiroNome(par.vermelho.nome), contarLados(par, painel.unidades).vermelho),
      ];
  const lider = par ? quemLidera(par) : null;
  const cenario = par ? cenarioDaDisputa(par, nacional) : null;
  if (cenario?.tipo === "eleito") falas.unshift(copy.cenarioEleito(primeiroNome(cenario.nome)));
  else if (lider) falas.push(copy.opiniaoAberta(primeiroNome(lider.nome)));
  const perguntas = montarPerguntas({
    copy,
    idioma,
    lugar: "",
    resultado: nacional,
    unidades: painel.unidades,
    cidades: [],
    eleitos: eleitosDaApuracao([painel.presidente, ...painel.governadores]),
  });
  return <Apresentador linhas={falas} perguntas={perguntas} />;
}
