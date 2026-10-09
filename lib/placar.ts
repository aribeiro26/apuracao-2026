import type { Candidato, Resultado } from "./conta";
import { semAcento } from "./format";

export type Lado = "azul" | "vermelho";

export type Par = { azul: Candidato; vermelho: Candidato };

function nome(cand: Candidato): string {
  return semAcento(cand.nome).toLowerCase();
}

export function parDaDisputa(candidatos: Candidato[]): Par | null {
  const flavio = candidatos.find((cand) => nome(cand).includes("flavio"));
  const lula = candidatos.find((cand) => nome(cand).includes("lula"));
  if (flavio && lula) return { azul: flavio, vermelho: lula };
  const seguem = candidatos.filter((cand) => cand.fase === "segundo-turno");
  const base = (seguem.length >= 2 ? seguem : candidatos).slice().sort((a, b) => b.votos - a.votos);
  if (base.length < 2) return null;
  return { azul: base[0], vermelho: base[1] };
}

export function ladoDe(par: Par, cand: Candidato | undefined): Lado | "neutro" {
  if (!cand) return "neutro";
  if (cand.sqcand === par.azul.sqcand) return "azul";
  if (cand.sqcand === par.vermelho.sqcand) return "vermelho";
  return "neutro";
}

export function vencedorLocal(par: Par, candidatos: Candidato[] | null | undefined): Lado | "neutro" {
  if (!candidatos?.length) return "neutro";
  const azul = candidatos.find((cand) => cand.sqcand === par.azul.sqcand);
  const vermelho = candidatos.find((cand) => cand.sqcand === par.vermelho.sqcand);
  if (!azul || !vermelho || azul.votos === vermelho.votos) return "neutro";
  return azul.votos > vermelho.votos ? "azul" : "vermelho";
}

export function disputaFechada(resultado: Resultado, par: Par): boolean {
  const dois = par.azul.votos + par.vermelho.votos;
  return dois > 0 && dois >= resultado.totais.votosValidos * 0.98;
}

export function faltaParaPassar(par: Par): { atrasado: Candidato; votos: number } | null {
  if (par.azul.votos === par.vermelho.votos) return null;
  const lider = par.azul.votos > par.vermelho.votos ? par.azul : par.vermelho;
  const atrasado = lider === par.azul ? par.vermelho : par.azul;
  return { atrasado, votos: lider.votos - atrasado.votos + 1 };
}

export function quemLidera(par: Par): Candidato | null {
  if (par.azul.votos === par.vermelho.votos) return null;
  return par.azul.votos > par.vermelho.votos ? par.azul : par.vermelho;
}

export type Cenario =
  | { tipo: "segue" }
  | { tipo: "empate" }
  | { tipo: "eleito"; nome: string }
  | { tipo: "aberto"; nome: string; faltam: number | null };

/** Eleito só se o outro não alcança nem com os votos que ainda cabem, ou se as urnas fecharam. */
export function cenarioDaDisputa(par: Par, resultado: Resultado): Cenario {
  if (resultado.turno === 1 || resultado.modo === "aguardando") return { tipo: "segue" };
  const lider = quemLidera(par);
  if (!lider) return { tipo: "empate" };
  const outro = lider.sqcand === par.azul.sqcand ? par.vermelho : par.azul;
  const vantagem = lider.votos - outro.votos;
  const restantes = Math.max(0, resultado.totais.eleitorado - resultado.totais.comparecimento - resultado.totais.abstencao);
  const fechou = resultado.totais.secoesTotal > 0 && resultado.totais.secoesApuradas >= resultado.totais.secoesTotal;
  if (vantagem > 0 && (fechou || (restantes > 0 && vantagem > restantes))) return { tipo: "eleito", nome: lider.nome };
  return { tipo: "aberto", nome: lider.nome, faltam: restantes > 0 ? restantes : null };
}

export function contarLados(par: Par, unidades: Resultado[]): { azul: number; vermelho: number } {
  let azul = 0;
  let vermelho = 0;
  for (const unidade of unidades) {
    if (unidade.uf === "zz") continue;
    const lado = vencedorLocal(par, unidade.candidatos);
    if (lado === "azul") azul += 1;
    if (lado === "vermelho") vermelho += 1;
  }
  return { azul, vermelho };
}
