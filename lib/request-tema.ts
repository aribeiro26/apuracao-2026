import { headers } from "next/headers";
import { temaDe, type Tema } from "./tema";

export async function resolveTema(): Promise<Tema> {
  const cabecalhos = await headers();
  return temaDe(cabecalhos.get("x-tema"));
}
