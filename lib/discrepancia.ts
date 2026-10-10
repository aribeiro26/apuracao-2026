export type Ponto = {
  slot: string;
  cargo: string;
  uf: string;
  nomeUf: string;
  sqcand: string;
  nome: string;
  partido: string;
  votos: number;
  pct: number;
  votosValidos: number;
  secoesApuradas: number;
  secoesTotal: number;
};

export type Disputa = { cargo: string; uf: string; nomeUf: string };

export type Alerta =
  | { tipo: "votos-caiu"; slot: string; cargo: string; uf: string; nomeUf: string; nome: string; antes: number; depois: number }
  | { tipo: "urnas-caiu"; slot: string; cargo: string; uf: string; nomeUf: string; antes: number; depois: number }
  | { tipo: "soma"; slot: string; cargo: string; uf: string; nomeUf: string; soma: number; validos: number }
  | { tipo: "percentual"; slot: string; cargo: string; uf: string; nomeUf: string; nome: string; informado: number; conta: number }
  | { tipo: "brasil"; slot: string; nome: string; nacional: number; estados: number }
  | { tipo: "buraco"; slot: string; cargo: string; uf: string; nomeUf: string; anterior: string }
  | { tipo: "salto"; slot: string; cargo: string; uf: string; nomeUf: string; nome: string; diferenca: number };

const FOLGA_PCT = 0.15;
const SALTO_SEM_URNA = 1000;
const ESTADOS_PARA_COMPARAR = 27;

export function disputasDe(pontos: Ponto[]): Disputa[] {
  const mapa = new Map<string, Disputa>();
  for (const ponto of pontos) {
    const chave = `${ponto.cargo}|${ponto.uf}`;
    if (!mapa.has(chave)) mapa.set(chave, { cargo: ponto.cargo, uf: ponto.uf, nomeUf: ponto.nomeUf });
  }
  return [...mapa.values()].sort((a, b) => {
    const peso = (item: Disputa) => (item.cargo === "presidente" ? 0 : 1) * 100 + (item.uf === "br" ? 0 : 1);
    return peso(a) - peso(b) || a.nomeUf.localeCompare(b.nomeUf, "pt-BR");
  });
}

export function acharDiscrepancias(pontos: Ponto[]): Alerta[] {
  const alertas: Alerta[] = [];
  const grupos = new Map<string, Ponto[]>();
  for (const ponto of pontos) {
    const chave = `${ponto.cargo}|${ponto.uf}`;
    const lista = grupos.get(chave) ?? [];
    lista.push(ponto);
    grupos.set(chave, lista);
  }
  for (const lista of grupos.values()) alertas.push(...daDisputa(lista));
  alertas.push(...doBrasil(pontos));
  return alertas.sort((a, b) => a.slot.localeCompare(b.slot) || a.tipo.localeCompare(b.tipo));
}

function daDisputa(lista: Ponto[]): Alerta[] {
  const alertas: Alerta[] = [];
  const porSlot = new Map<string, Ponto[]>();
  for (const ponto of lista) {
    const atual = porSlot.get(ponto.slot) ?? [];
    atual.push(ponto);
    porSlot.set(ponto.slot, atual);
  }
  const slots = [...porSlot.keys()].sort();
  const exemplo = lista[0];
  for (let i = 1; i < slots.length; i += 1) {
    const esperado = proximoSlot(slots[i - 1]);
    if (esperado && esperado < slots[i]) {
      alertas.push({
        tipo: "buraco",
        slot: esperado,
        anterior: slots[i - 1],
        cargo: exemplo.cargo,
        uf: exemplo.uf,
        nomeUf: exemplo.nomeUf,
      });
    }
  }
  let anterior: Map<string, Ponto> | null = null;
  let urnasAnteriores: number | null = null;
  for (const slot of slots) {
    const atual = porSlot.get(slot) ?? [];
    const base = atual[0];
    const soma = atual.reduce((total, ponto) => total + ponto.votos, 0);
    if (base.votosValidos > 0 && soma !== base.votosValidos) {
      alertas.push({
        tipo: "soma",
        slot,
        cargo: base.cargo,
        uf: base.uf,
        nomeUf: base.nomeUf,
        soma,
        validos: base.votosValidos,
      });
    }
    for (const ponto of atual) {
      if (ponto.votosValidos <= 0) continue;
      const conta = (ponto.votos / ponto.votosValidos) * 100;
      if (Math.abs(conta - ponto.pct) > FOLGA_PCT) {
        alertas.push({
          tipo: "percentual",
          slot,
          cargo: ponto.cargo,
          uf: ponto.uf,
          nomeUf: ponto.nomeUf,
          nome: ponto.nome,
          informado: ponto.pct,
          conta,
        });
      }
    }
    if (anterior && urnasAnteriores != null) {
      if (base.secoesApuradas < urnasAnteriores) {
        alertas.push({
          tipo: "urnas-caiu",
          slot,
          cargo: base.cargo,
          uf: base.uf,
          nomeUf: base.nomeUf,
          antes: urnasAnteriores,
          depois: base.secoesApuradas,
        });
      }
      for (const ponto of atual) {
        const velho = anterior.get(ponto.sqcand);
        if (!velho) continue;
        if (ponto.votos < velho.votos) {
          alertas.push({
            tipo: "votos-caiu",
            slot,
            cargo: ponto.cargo,
            uf: ponto.uf,
            nomeUf: ponto.nomeUf,
            nome: ponto.nome,
            antes: velho.votos,
            depois: ponto.votos,
          });
        }
        if (base.secoesApuradas === urnasAnteriores && Math.abs(ponto.votos - velho.votos) >= SALTO_SEM_URNA) {
          alertas.push({
            tipo: "salto",
            slot,
            cargo: ponto.cargo,
            uf: ponto.uf,
            nomeUf: ponto.nomeUf,
            nome: ponto.nome,
            diferenca: ponto.votos - velho.votos,
          });
        }
      }
    }
    anterior = new Map(atual.map((ponto) => [ponto.sqcand, ponto]));
    urnasAnteriores = base.secoesApuradas;
  }
  return alertas;
}

function doBrasil(pontos: Ponto[]): Alerta[] {
  const nacionais = pontos.filter((ponto) => ponto.cargo === "presidente" && ponto.uf === "br");
  const estaduais = pontos.filter((ponto) => ponto.cargo === "presidente" && ponto.uf !== "br");
  const alertas: Alerta[] = [];
  const slots = [...new Set(nacionais.map((ponto) => ponto.slot))];
  for (const slot of slots) {
    for (const nacional of nacionais.filter((ponto) => ponto.slot === slot)) {
      const partes = estaduais.filter((ponto) => ponto.slot === slot && ponto.sqcand === nacional.sqcand);
      const ufs = new Set(partes.map((ponto) => ponto.uf));
      if (ufs.size < ESTADOS_PARA_COMPARAR) continue;
      const estados = partes.reduce((total, ponto) => total + ponto.votos, 0);
      const folga = Math.max(500, Math.round(nacional.votos * 0.0005));
      if (Math.abs(nacional.votos - estados) > folga) {
        alertas.push({ tipo: "brasil", slot, nome: nacional.nome, nacional: nacional.votos, estados });
      }
    }
  }
  return alertas;
}

function proximoSlot(slot: string): string | null {
  const [dia, hora] = slot.split("T");
  if (!dia || !hora) return null;
  const [ano, mes, d] = dia.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  if (![ano, mes, d, hh, mm].every((n) => Number.isFinite(n))) return null;
  const data = new Date(Date.UTC(ano, mes - 1, d, hh, mm + 30));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${data.getUTCFullYear()}-${p(data.getUTCMonth() + 1)}-${p(data.getUTCDate())}T${p(data.getUTCHours())}:${p(data.getUTCMinutes())}`;
}
