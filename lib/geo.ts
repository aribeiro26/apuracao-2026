type Caixa = { uf: string; sul: number; norte: number; oeste: number; leste: number };

/** Caixas aproximadas. A menor que contém o ponto ganha, para o DF não cair em Goiás. */
const CAIXAS: Caixa[] = [
  { uf: "df", sul: -16.05, norte: -15.5, oeste: -48.25, leste: -47.3 },
  { uf: "se", sul: -11.6, norte: -9.5, oeste: -38.25, leste: -36.4 },
  { uf: "al", sul: -10.5, norte: -8.8, oeste: -38.25, leste: -35.15 },
  { uf: "rn", sul: -6.98, norte: -4.83, oeste: -38.58, leste: -34.97 },
  { uf: "pb", sul: -7.55, norte: -6.02, oeste: -38.77, leste: -34.79 },
  { uf: "es", sul: -21.3, norte: -17.89, oeste: -41.88, leste: -39.65 },
  { uf: "rj", sul: -23.37, norte: -20.76, oeste: -44.89, leste: -40.96 },
  { uf: "sc", sul: -29.35, norte: -25.96, oeste: -53.84, leste: -48.36 },
  { uf: "pe", sul: -9.48, norte: -7.15, oeste: -41.36, leste: -34.81 },
  { uf: "ce", sul: -7.86, norte: -2.78, oeste: -41.42, leste: -37.25 },
  { uf: "rr", sul: -1.58, norte: 5.27, oeste: -64.83, leste: -58.89 },
  { uf: "ap", sul: -1.23, norte: 4.44, oeste: -54.88, leste: -49.88 },
  { uf: "ac", sul: -11.14, norte: -7.11, oeste: -73.99, leste: -66.62 },
  { uf: "ro", sul: -13.69, norte: -7.97, oeste: -66.81, leste: -59.77 },
  { uf: "to", sul: -13.47, norte: -5.16, oeste: -50.74, leste: -45.7 },
  { uf: "ms", sul: -24.07, norte: -17.17, oeste: -58.17, leste: -50.92 },
  { uf: "pr", sul: -26.72, norte: -22.52, oeste: -54.62, leste: -48.02 },
  { uf: "rs", sul: -33.75, norte: -27.08, oeste: -57.65, leste: -49.69 },
  { uf: "sp", sul: -25.31, norte: -19.78, oeste: -53.11, leste: -44.16 },
  { uf: "go", sul: -19.5, norte: -12.39, oeste: -53.25, leste: -45.91 },
  { uf: "ma", sul: -10.26, norte: -1.04, oeste: -48.15, leste: -41.8 },
  { uf: "pi", sul: -10.93, norte: -2.74, oeste: -45.99, leste: -40.37 },
  { uf: "ba", sul: -18.35, norte: -8.53, oeste: -46.62, leste: -37.34 },
  { uf: "mg", sul: -22.92, norte: -14.23, oeste: -51.05, leste: -39.86 },
  { uf: "mt", sul: -18.04, norte: -7.35, oeste: -61.63, leste: -50.22 },
  { uf: "pa", sul: -9.84, norte: 2.59, oeste: -58.9, leste: -46.06 },
  { uf: "am", sul: -9.82, norte: 2.24, oeste: -73.8, leste: -56.1 },
];

const CENTROS: { uf: string; lat: number; lng: number }[] = [
  { uf: "ac", lat: -9.02, lng: -70.81 },
  { uf: "al", lat: -9.57, lng: -36.78 },
  { uf: "ap", lat: 1.41, lng: -51.77 },
  { uf: "am", lat: -3.47, lng: -65.1 },
  { uf: "ba", lat: -12.28, lng: -41.93 },
  { uf: "ce", lat: -5.2, lng: -39.53 },
  { uf: "df", lat: -15.78, lng: -47.93 },
  { uf: "es", lat: -19.57, lng: -40.67 },
  { uf: "go", lat: -15.93, lng: -49.84 },
  { uf: "ma", lat: -5.4, lng: -45.44 },
  { uf: "mt", lat: -12.64, lng: -55.42 },
  { uf: "ms", lat: -20.51, lng: -54.54 },
  { uf: "mg", lat: -18.51, lng: -44.55 },
  { uf: "pa", lat: -3.79, lng: -52.48 },
  { uf: "pb", lat: -7.24, lng: -36.78 },
  { uf: "pr", lat: -24.63, lng: -51.35 },
  { uf: "pe", lat: -8.38, lng: -37.86 },
  { uf: "pi", lat: -7.72, lng: -42.73 },
  { uf: "rj", lat: -22.17, lng: -42.66 },
  { uf: "rn", lat: -5.81, lng: -36.59 },
  { uf: "rs", lat: -30.17, lng: -53.5 },
  { uf: "ro", lat: -10.94, lng: -62.83 },
  { uf: "rr", lat: 1.99, lng: -61.33 },
  { uf: "sc", lat: -27.24, lng: -50.22 },
  { uf: "sp", lat: -22.19, lng: -48.79 },
  { uf: "se", lat: -10.57, lng: -37.45 },
  { uf: "to", lat: -10.15, lng: -48.33 },
];

export function ufPorCoordenada(lat: number, lng: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -34 || lat > 6 || lng < -75 || lng > -28) return null;
  const dentro = CAIXAS.filter((caixa) => lat >= caixa.sul && lat <= caixa.norte && lng >= caixa.oeste && lng <= caixa.leste);
  if (dentro.length) {
    dentro.sort((a, b) => (a.norte - a.sul) * (a.leste - a.oeste) - (b.norte - b.sul) * (b.leste - b.oeste));
    return dentro[0].uf;
  }
  let melhor = CENTROS[0];
  let distancia = Number.POSITIVE_INFINITY;
  for (const centro of CENTROS) {
    const d = (centro.lat - lat) ** 2 + (centro.lng - lng) ** 2;
    if (d < distancia) {
      distancia = d;
      melhor = centro;
    }
  }
  return melhor.uf;
}
