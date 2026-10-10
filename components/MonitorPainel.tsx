import { BotaoTema } from "@/components/LocaleProvider";
import type { Alerta, Disputa, Ponto } from "@/lib/discrepancia";
import { numero, percentual } from "@/lib/format";
import type { MonitorCopy } from "@/lib/monitor-copy";

const CORES = ["#1d4e89", "#9f2d2d", "#0f6b4c", "#9a3412"];

export function MonitorPainel({
  copy,
  idioma,
  pontos,
  disputas,
  disputa,
  alertas,
  falha,
  hrefDe,
}: {
  copy: MonitorCopy;
  idioma: string;
  pontos: Ponto[];
  disputas: Disputa[];
  disputa: Disputa | null;
  alertas: Alerta[];
  falha: boolean;
  hrefDe: (cargo: string, uf: string) => string;
}) {
  const serie = disputa ? pontos.filter((ponto) => ponto.cargo === disputa.cargo && ponto.uf === disputa.uf) : [];
  const slots = [...new Set(serie.map((ponto) => ponto.slot))].sort();
  const daTela = disputa
    ? alertas.filter((alerta) => {
        if (alerta.tipo === "brasil") return disputa.cargo === "presidente" && disputa.uf === "br";
        return alerta.cargo === disputa.cargo && alerta.uf === disputa.uf;
      })
    : [];
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <a href="/" className="text-sm underline">
            {copy.voltar}
          </a>
          <h1 className="mt-2 font-serif text-4xl">{copy.titulo}</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{copy.nota}</p>
        </div>
        <BotaoTema />
      </header>

      {falha ? <p className="mt-8 text-sm text-[var(--mark)]">{copy.falha}</p> : null}

      {!falha && !disputa ? <p className="mt-8 text-sm text-[var(--muted)]">{copy.vazio}</p> : null}

      {disputa ? (
        <>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label={copy.titulo}>
            {disputas.map((item) => {
              const ativo = item.cargo === disputa.cargo && item.uf === disputa.uf;
              return (
                <a
                  key={`${item.cargo}-${item.uf}`}
                  href={hrefDe(item.cargo, item.uf)}
                  aria-current={ativo ? "true" : undefined}
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm ${ativo ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--line)]"}`}
                >
                  {item.cargo === "governador" ? copy.governador : copy.presidente} · {item.nomeUf}
                </a>
              );
            })}
          </nav>

          <section className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-4" aria-label={copy.evolucao}>
            <h2 className="font-serif text-2xl">{copy.evolucao}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {copy.amostras(slots.length)}
              {slots.length ? ` · ${horaDe(slots[0])}–${horaDe(slots[slots.length - 1])}` : ""}
            </p>
            <Grafico serie={serie} slots={slots} suspeitos={new Set(daTela.map((alerta) => alerta.slot))} />
          </section>

          <section className="mt-6" aria-label={copy.alertas}>
            <h2 className="font-serif text-2xl">{copy.alertas}</h2>
            {daTela.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{copy.semAlerta}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {daTela.map((alerta) => (
                  <li key={chaveDe(alerta)} className="rounded-2xl border border-[var(--mark)] bg-[var(--danger-bg)] px-4 py-3">
                    <p className="text-sm font-medium text-[var(--mark)]">
                      {horaDe(alerta.slot)} · {tituloDa(copy, alerta.tipo)}
                    </p>
                    <p className="mt-1 text-sm">{detalheDe(alerta, idioma)}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{textoDa(copy, alerta.tipo)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8" aria-label={copy.historico}>
            <h2 className="font-serif text-2xl">{copy.historico}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">{copy.hora}</th>
                    <th className="py-2 pr-3 font-medium">{copy.candidato}</th>
                    <th className="py-2 pr-3 font-medium">{copy.votos}</th>
                    <th className="py-2 pr-3 font-medium">%</th>
                    <th className="py-2 font-medium">{copy.urnas}</th>
                  </tr>
                </thead>
                <tbody>
                  {serie
                    .slice()
                    .sort((a, b) => a.slot.localeCompare(b.slot) || b.votos - a.votos)
                    .map((ponto) => (
                      <tr key={`${ponto.slot}-${ponto.sqcand}`} className="border-t border-[var(--line)]">
                        <td className="py-2 pr-3 tabular-nums">{horaDe(ponto.slot)}</td>
                        <td className="py-2 pr-3">
                          {ponto.nome}
                          {ponto.partido ? <span className="text-[var(--muted)]"> · {ponto.partido}</span> : null}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{numero(ponto.votos, idioma)}</td>
                        <td className="py-2 pr-3 tabular-nums">{percentual(ponto.pct, 2, idioma)}</td>
                        <td className="py-2 tabular-nums">
                          {numero(ponto.secoesApuradas, idioma)}/{numero(ponto.secoesTotal, idioma)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function Grafico({ serie, slots, suspeitos }: { serie: Ponto[]; slots: string[]; suspeitos: Set<string> }) {
  if (!slots.length) return null;
  const nomes = new Map<string, { nome: string; partido: string }>();
  for (const ponto of serie) {
    if (!nomes.has(ponto.sqcand)) nomes.set(ponto.sqcand, { nome: ponto.nome, partido: ponto.partido });
  }
  const candidatos = [...nomes.keys()];
  const w = 640;
  const h = 240;
  const esquerda = 36;
  const direita = 8;
  const topo = 12;
  const base = 28;
  const largura = w - esquerda - direita;
  const altura = h - topo - base;
  const x = (indice: number) => esquerda + (slots.length === 1 ? largura / 2 : (indice / (slots.length - 1)) * largura);
  const y = (pct: number) => topo + (1 - Math.min(100, Math.max(0, pct)) / 100) * altura;
  const porCand = new Map<string, Map<string, number>>();
  for (const ponto of serie) {
    const mapa = porCand.get(ponto.sqcand) ?? new Map<string, number>();
    mapa.set(ponto.slot, ponto.pct);
    porCand.set(ponto.sqcand, mapa);
  }
  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full min-w-[20rem]" role="img" aria-label={slots.join(", ")}>
        {[0, 50, 100].map((marca) => (
          <g key={marca}>
            <line x1={esquerda} x2={w - direita} y1={y(marca)} y2={y(marca)} stroke="var(--line)" />
            <text x={0} y={y(marca) + 4} fill="var(--muted)" fontSize="11">
              {marca}
            </text>
          </g>
        ))}
        {slots.map((slot, indice) =>
          suspeitos.has(slot) ? (
            <line key={slot} x1={x(indice)} x2={x(indice)} y1={topo} y2={topo + altura} stroke="var(--mark)" strokeDasharray="3 3" />
          ) : null,
        )}
        {candidatos.map((sqcand, indice) => {
          const mapa = porCand.get(sqcand) ?? new Map();
          const cor = CORES[indice % CORES.length];
          const pontos = slots.flatMap((slot, ordem) => (mapa.has(slot) ? [`${x(ordem)},${y(mapa.get(slot) ?? 0)}`] : []));
          return (
            <g key={sqcand}>
              <polyline fill="none" stroke={cor} strokeWidth="2.5" points={pontos.join(" ")} />
              {slots.map((slot, ordem) =>
                mapa.has(slot) ? <circle key={slot} cx={x(ordem)} cy={y(mapa.get(slot) ?? 0)} r={suspeitos.has(slot) ? 4.5 : 3} fill={suspeitos.has(slot) ? "var(--mark)" : cor} /> : null,
              )}
            </g>
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {candidatos.map((sqcand, indice) => {
          const pessoa = nomes.get(sqcand);
          return (
            <li key={sqcand} className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CORES[indice % CORES.length] }} />
              {pessoa?.nome}
              {pessoa?.partido ? <span className="text-[var(--muted)]">{pessoa.partido}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function horaDe(slot: string): string {
  const hora = slot.split("T")[1];
  return hora || slot;
}

function tituloDa(copy: MonitorCopy, tipo: string): string {
  return copy.regras.find((regra) => regra.tipo === tipo)?.titulo ?? tipo;
}

function textoDa(copy: MonitorCopy, tipo: string): string {
  return copy.regras.find((regra) => regra.tipo === tipo)?.texto ?? "";
}

function detalheDe(alerta: Alerta, idioma: string): string {
  if (alerta.tipo === "votos-caiu") return `${alerta.nome}: ${numero(alerta.antes, idioma)} → ${numero(alerta.depois, idioma)}`;
  if (alerta.tipo === "urnas-caiu") return `${numero(alerta.antes, idioma)} → ${numero(alerta.depois, idioma)}`;
  if (alerta.tipo === "soma") return `${numero(alerta.soma, idioma)} ≠ ${numero(alerta.validos, idioma)}`;
  if (alerta.tipo === "percentual") return `${alerta.nome}: ${percentual(alerta.informado, 2, idioma)} ≠ ${percentual(alerta.conta, 2, idioma)}`;
  if (alerta.tipo === "brasil") return `${alerta.nome}: ${numero(alerta.nacional, idioma)} ≠ ${numero(alerta.estados, idioma)}`;
  if (alerta.tipo === "salto") {
    const sinal = alerta.diferenca > 0 ? "+" : "";
    return `${alerta.nome}: ${sinal}${numero(alerta.diferenca, idioma)}`;
  }
  return alerta.anterior ? `${horaDe(alerta.anterior)} → ${horaDe(alerta.slot)}` : horaDe(alerta.slot);
}

function chaveDe(alerta: Alerta): string {
  if (alerta.tipo === "votos-caiu" || alerta.tipo === "percentual" || alerta.tipo === "salto") return `${alerta.tipo}-${alerta.slot}-${alerta.nome}`;
  if (alerta.tipo === "brasil") return `${alerta.tipo}-${alerta.slot}-${alerta.nome}`;
  if (alerta.tipo === "buraco") return `${alerta.tipo}-${alerta.slot}-${alerta.uf}`;
  return `${alerta.tipo}-${alerta.slot}-${alerta.uf}`;
}
