/** Texto que pode ir para a tela ou para o log: sem tag, sem controle, tamanho limitado. */

const TAG = /<[^>]*>/g;
const PERIGOSO = /[<>"'`\\]/g;
const CONTROLE = /[\u0000-\u001F\u007F]/g;

export function textoPlano(valor: unknown, max = 80): string {
  const bruto = String(valor ?? "");
  return bruto.replace(TAG, "").replace(PERIGOSO, "").replace(CONTROLE, "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function soDigitos(valor: unknown, max: number): string {
  const digitos = String(valor ?? "").replace(/\D/g, "");
  return digitos.slice(0, max);
}

export function rastreioVisivel(valor: string): string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor) ? valor : "";
}
