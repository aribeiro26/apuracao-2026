/** Janela deslizante e vagas simultâneas, só nesta instância. */

const marcas = new Map<string, number[]>();
const emCurso = new Map<string, number>();
const MAX_CHAVES = 4000;

export function consumir(chave: string, max: number, janelaMs: number, agora = Date.now()): boolean {
  const corte = agora - janelaMs;
  let lista = marcas.get(chave);
  if (!lista) {
    if (marcas.size >= MAX_CHAVES) {
      for (const [existente, tempos] of marcas) {
        if (!tempos.some((t) => t > corte)) marcas.delete(existente);
      }
      if (marcas.size >= MAX_CHAVES) return false;
    }
    lista = [];
  }
  const viva = lista.filter((t) => t > corte);
  if (viva.length >= max) {
    marcas.set(chave, viva);
    return false;
  }
  viva.push(agora);
  marcas.set(chave, viva);
  return true;
}

export function entrar(chave: string, max: number): boolean {
  const atual = emCurso.get(chave) ?? 0;
  if (atual >= max) return false;
  emCurso.set(chave, atual + 1);
  return true;
}

export function sair(chave: string): void {
  const atual = emCurso.get(chave) ?? 0;
  if (atual <= 1) emCurso.delete(chave);
  else emCurso.set(chave, atual - 1);
}
