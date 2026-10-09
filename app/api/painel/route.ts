import { NextResponse } from "next/server";
import { UFS, UFS_PRESIDENTE } from "@/lib/uf";
import { NaoPublicado, mapPool, obterResultado } from "@/lib/tse";
import { somarResultados } from "@/lib/conta";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const presidente = await obterResultado("presidente", "br");
    const [governadores, presidenciais] = await Promise.all([
      mapPool(UFS, 8, async (uf) => {
        try {
          return await obterResultado("governador", uf.sigla);
        } catch (erro) {
          if (erro instanceof NaoPublicado) return null;
          throw erro;
        }
      }),
      mapPool(UFS_PRESIDENTE, 8, async (uf) => {
        try {
          return await obterResultado("presidente", uf.sigla);
        } catch (erro) {
          if (erro instanceof NaoPublicado) return null;
          throw erro;
        }
      }),
    ]);
    const partes = presidenciais.filter((item) => item != null);
    const somaEstados = somarResultados(presidente, partes);
    return NextResponse.json(
      {
        fonte: "TSE – divulgação oficial de resultados",
        aviso:
          "Números oficiais, sem projeção. O total do Brasil nesta página é a soma das unidades da federação e do exterior. Cada unidade, por sua vez, é a soma dos municípios — confira abrindo o estado.",
        presidente,
        somaEstados,
        unidades: partes,
        governadores: governadores.filter((item) => item != null),
      },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } },
    );
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Falha ao consultar o TSE.";
    return NextResponse.json({ erro: mensagem }, { status: 502 });
  }
}
