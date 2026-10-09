export type Tema = "claro" | "escuro";

export function temaDe(valor: string | null | undefined): Tema {
  return valor === "escuro" ? "escuro" : "claro";
}
