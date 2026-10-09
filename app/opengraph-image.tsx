import { ImageResponse } from "next/og";

export const alt = "Apuração do 2º turno 2026: presidente e governadores, com os arquivos públicos do TSE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagem() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#14324f",
          color: "#f7f4ee",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 1 }}>Eleições 2026 · TSE</div>
        <div style={{ display: "flex", fontSize: 68, marginTop: 18, lineHeight: 1.05 }}>Apuração do 2º turno</div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 28 }}>Presidente e governadores · 25 de outubro de 2026</div>
      </div>
    ),
    { ...size },
  );
}
