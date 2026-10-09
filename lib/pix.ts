import crypto from "crypto";
import QRCode from "qrcode";

const SELO = {
  key: "ZNDrGow0aVuYXbeIBN8zL9G7qE860Ywl5CgvkOh5enE=",
  iv: "lmkxfrCOR9MaoxPf",
  tag: "gLU5UuAlrozcPCQBYw+lkw==",
  enc: "bAhcxE8LUlLtFsrUr84=",
};

export const PIX_HASH = "849d552624d9a48c72b2f7dc3a4c9699f0b61cb975624f9fc91a5add3808d3d5";

function abrirChave(): string {
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(SELO.key, "base64"), Buffer.from(SELO.iv, "base64"));
  decipher.setAuthTag(Buffer.from(SELO.tag, "base64"));
  const aberto = Buffer.concat([decipher.update(Buffer.from(SELO.enc, "base64")), decipher.final()]);
  return aberto.toString("utf8");
}

function tlv(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, "0") + valor;
}

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function payloadPix(chave: string): string {
  const comerciante = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", chave));
  const corpo =
    tlv("00", "01") +
    comerciante +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("58", "BR") +
    tlv("59", "DOACAO") +
    tlv("60", "BRASIL") +
    tlv("62", tlv("05", "***")) +
    "6304";
  return corpo + crc16(corpo);
}

export function seloConfere(): boolean {
  const chave = abrirChave();
  if (crypto.createHash("sha256").update(chave).digest("hex") !== PIX_HASH) return false;
  const payload = payloadPix(chave);
  if (!payload.includes(chave)) return false;
  return crc16(payload.slice(0, -4)) === payload.slice(-4);
}

export async function pngDoPix(): Promise<Buffer> {
  const chave = abrirChave();
  const digest = crypto.createHash("sha256").update(chave).digest("hex");
  if (digest !== PIX_HASH) throw new Error("Selo do PIX inválido.");
  return QRCode.toBuffer(payloadPix(chave), {
    type: "png",
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1c1916", light: "#fffdf8" },
  });
}
