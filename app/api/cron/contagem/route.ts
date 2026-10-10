import { cronAutorizado } from "@/lib/cron-auth";
import { gravarContagem } from "@/lib/historico";

export const maxDuration = 60;

export async function GET(pedido: Request) {
  if (!(await cronAutorizado(pedido.headers.get("authorization")))) {
    return Response.json({ ok: false }, { status: 401 });
  }
  try {
    const resultado = await gravarContagem();
    return Response.json({ ok: true, ...resultado });
  } catch {
    return Response.json({ ok: false, porque: "falha" }, { status: 500 });
  }
}
