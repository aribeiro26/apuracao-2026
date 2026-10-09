import { NextResponse } from "next/server";
import type { Cargo } from "@/lib/conta";
import { PedidoInvalido, listarMunicipios } from "@/lib/tse";

export const runtime = "nodejs";

function cargoDe(valor: string | null): Cargo {
  if (valor === "governador") return "governador";
  if (valor === "presidente") return "presidente";
  throw new PedidoInvalido("Cargo inválido.");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const cargo = cargoDe(searchParams.get("cargo"));
    const uf = searchParams.get("uf") ?? "";
    const municipios = await listarMunicipios(cargo, uf);
    return NextResponse.json(
      { uf: uf.toLowerCase(), total: municipios.length, municipios },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (erro) {
    const status = erro instanceof PedidoInvalido ? 400 : 502;
    const mensagem = erro instanceof Error ? erro.message : "Falha ao listar municípios.";
    return NextResponse.json({ erro: mensagem }, { status });
  }
}
