import type { Resultado } from "@/lib/conta";
import { cenarioDaDisputa, parDaDisputa } from "@/lib/placar";
import { textoPlano } from "@/lib/texto";

export type CenarioIa = "" | "segue" | "empate" | "eleito" | "aberto";

export type TelaIa = {
  lugar: string;
  cargo: "" | "presidente" | "governador";
  turno: 0 | 1 | 2;
  modo: "" | "ao-vivo" | "aguardando" | "definido";
  cenario: CenarioIa;
  eleito: string;
  candidatos: { nome: string; partido: string; votos: number }[];
  secoesApuradas: number;
  secoesTotal: number;
  votosValidos: number;
};

export function limparPergunta(valor: unknown): string {
  return String(valor ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

function inteiro(valor: unknown, max: number): number {
  const numero = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return 0;
  return Math.min(max, Math.round(numero));
}

function vazio(lugar: string): TelaIa {
  return {
    lugar: textoPlano(lugar, 120),
    cargo: "",
    turno: 0,
    modo: "",
    cenario: "",
    eleito: "",
    candidatos: [],
    secoesApuradas: 0,
    secoesTotal: 0,
    votosValidos: 0,
  };
}

export function normalizarTela(valor: unknown): TelaIa {
  const bruto = valor && typeof valor === "object" ? (valor as Partial<TelaIa>) : {};
  const cargo = bruto.cargo === "presidente" || bruto.cargo === "governador" ? bruto.cargo : "";
  const turno = bruto.turno === 1 || bruto.turno === 2 ? bruto.turno : 0;
  const modo = bruto.modo === "ao-vivo" || bruto.modo === "aguardando" || bruto.modo === "definido" ? bruto.modo : "";
  const cenario = bruto.cenario === "segue" || bruto.cenario === "empate" || bruto.cenario === "eleito" || bruto.cenario === "aberto" ? bruto.cenario : "";
  const lista = Array.isArray(bruto.candidatos) ? bruto.candidatos.slice(0, 2) : [];
  return {
    lugar: textoPlano(bruto.lugar, 120),
    cargo,
    turno,
    modo,
    cenario,
    eleito: cenario === "eleito" ? textoPlano(bruto.eleito, 80) : "",
    candidatos: lista.map((item) => {
      const cand = item && typeof item === "object" ? (item as { nome?: unknown; partido?: unknown; votos?: unknown }) : {};
      return {
        nome: textoPlano(cand.nome, 80),
        partido: textoPlano(cand.partido, 24),
        votos: inteiro(cand.votos, 1_000_000_000),
      };
    }),
    secoesApuradas: inteiro(bruto.secoesApuradas, 1_000_000),
    secoesTotal: inteiro(bruto.secoesTotal, 1_000_000),
    votosValidos: inteiro(bruto.votosValidos, 1_000_000_000),
  };
}

export function montarTela(resultado: Resultado | null, lugar: string): TelaIa {
  if (!resultado) return vazio(lugar);
  const par = parDaDisputa(resultado.candidatos);
  const cenario = par ? cenarioDaDisputa(par, resultado) : null;
  const base = par ? [par.azul, par.vermelho] : resultado.candidatos.slice(0, 2);
  return normalizarTela({
    lugar,
    cargo: resultado.cargo,
    turno: resultado.turno,
    modo: resultado.modo,
    cenario: cenario?.tipo ?? "",
    eleito: cenario?.tipo === "eleito" ? cenario.nome : "",
    candidatos: base.map((cand) => ({ nome: cand.nome, partido: cand.partido, votos: cand.votos })),
    secoesApuradas: resultado.totais.secoesApuradas,
    secoesTotal: resultado.totais.secoesTotal,
    votosValidos: resultado.totais.votosValidos,
  });
}
