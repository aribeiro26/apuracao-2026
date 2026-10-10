import { gravarContagem } from "@/lib/historico";

export const maxDuration = 60;

export async function GET(pedido: Request) {
  const segredo = process.env.CRON_SECRET;
  const enviado = pedido.headers.get("authorization");
  if (!segredo || enviado !== `Bearer ${segredo}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  try {
    const resultado = await gravarContagem();
    return Response.json({ ok: true, ...resultado });
  } catch {
    return Response.json({ ok: false, porque: "falha" }, { status: 500 });
  }
}
