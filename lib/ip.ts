const IP = /^[0-9a-fA-F:.]{2,64}$/;

function primeiroIp(valor: string | null): string {
  const ip = valor?.split(",")[0]?.trim() ?? "";
  return IP.test(ip) ? ip : "";
}

/** Prefere o IP que a plataforma gravou. O visitante não escolhe esse valor. */
export function ipConfiavel(cabecalhos: Headers): string {
  const vercel = primeiroIp(cabecalhos.get("x-vercel-forwarded-for"));
  if (vercel) return vercel;
  const real = primeiroIp(cabecalhos.get("x-real-ip"));
  if (real) return real;
  return "local";
}

/** IP usado para travar um segundo voto. Fora da Vercel não há endereço confiável. */
export function ipDeVoto(cabecalhos: Headers): string | null {
  const ip = ipConfiavel(cabecalhos);
  if (!ip || ip === "local") return null;
  return ip;
}
