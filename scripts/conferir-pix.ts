import { pngDoPix, seloConfere } from "../lib/pix";

async function main() {
  if (!seloConfere()) throw new Error("O selo do PIX não confere.");
  const png = await pngDoPix();
  const assinatura = png.subarray(0, 8).toString("hex");
  if (assinatura !== "89504e470d0a1a0a") throw new Error("O QR não é um PNG.");
  console.log("QR PIX gerado no servidor, sem mostrar a chave. PNG", png.length, "bytes.");
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
