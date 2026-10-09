import type { Resultado } from "@/lib/conta";
import { percentual, razao } from "@/lib/format";
import type { Copy } from "@/lib/i18n";
import { parDaDisputa } from "@/lib/placar";
import { nomeLocal } from "@/lib/uf";

export function emSegundoTurno(resultado: Resultado): boolean {
  if (resultado.modo === "definido") return false;
  if (resultado.modo === "ao-vivo" || resultado.modo === "aguardando") return true;
  return resultado.candidatos.some((cand) => cand.fase === "segundo-turno");
}

function fraseDaChapa(resultado: Resultado, copy: Copy, idioma: string): string {
  const par = parDaDisputa(resultado.candidatos);
  if (!par) return "";
  const linha = (cand: typeof par.azul) =>
    copy.boletimCandidato(cand.nome, cand.partido || "", percentual(razao(cand.votos, resultado.totais.votosValidos), 2, idioma));
  return `${linha(par.azul)}. ${linha(par.vermelho)}`;
}

export function montarBoletim(
  presidente: Resultado | null,
  governadores: Resultado[],
  uf: string | null,
  copy: Copy,
  locale: "pt-BR" | "pt-PT" | "es" | "en",
  idioma: string,
): string {
  const partes: string[] = [];
  if (presidente && emSegundoTurno(presidente)) {
    const frase = fraseDaChapa(presidente, copy, idioma);
    if (frase) partes.push(copy.boletimPresidente(frase));
  }
  if (uf) {
    const governador = governadores.find((item) => item.uf === uf);
    if (governador && emSegundoTurno(governador)) {
      const frase = fraseDaChapa(governador, copy, idioma);
      if (frase) partes.push(copy.boletimGovernador(nomeLocal(uf, locale), frase));
    }
  }
  return partes.join(" ");
}
