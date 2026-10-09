import { NextResponse } from "next/server";
import type { Cargo } from "@/lib/conta";
import { PedidoInvalido, lerCidade, obterResultado } from "@/lib/tse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cargoParam = searchParams.get("cargo");
  const uf = searchParams.get("uf") ?? "";
  const codigo = searchParams.get("codigo") ?? "";
  if (cargoParam !== "presidente" && cargoParam !== "governador") {
    return NextResponse.json({ erro: "Cargo inválido." }, { status: 400 });
  }
  const cargo: Cargo = cargoParam;
  try {
    const [cidade, oficial] = await Promise.all([
      lerCidade(cargo, uf, codigo),
      obterResultado(cargo, uf === "br" ? "br" : uf),
    ]);
    return NextResponse.json(
      {
        cidade,
        modo: oficial.modo,
        turno: oficial.turno,
        atualizadoEm: cidade.atualizadoEm,
      },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } },
    );
  } catch (erro) {
    const status = erro instanceof PedidoInvalido ? 400 : 502;
    const mensagem = erro instanceof Error ? erro.message : "Falha ao ler o município.";
    return NextResponse.json({ erro: mensagem }, { status });
  }
}
