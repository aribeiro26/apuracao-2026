import { NextResponse } from "next/server";
import type { Cargo } from "@/lib/conta";
import { PedidoInvalido, lerLote } from "@/lib/tse";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cargoParam = searchParams.get("cargo");
  const uf = searchParams.get("uf") ?? "";
  const offset = Number(searchParams.get("offset") ?? "0");
  const limite = Number(searchParams.get("limit") ?? "8");
  if (cargoParam !== "presidente" && cargoParam !== "governador") {
    return NextResponse.json({ erro: "Cargo inválido." }, { status: 400 });
  }
  const cargo: Cargo = cargoParam;
  if (!Number.isFinite(offset) || offset < 0) {
    return NextResponse.json({ erro: "Offset inválido." }, { status: 400 });
  }
  try {
    const lote = await lerLote(cargo, uf, offset, limite);
    return NextResponse.json(
      { uf: uf.toLowerCase(), cargo, offset, ...lote },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } },
    );
  } catch (erro) {
    const status = erro instanceof PedidoInvalido ? 400 : 502;
    const mensagem = erro instanceof Error ? erro.message : "Falha ao ler municípios.";
    return NextResponse.json({ erro: mensagem }, { status });
  }
}
