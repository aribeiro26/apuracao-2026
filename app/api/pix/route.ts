import { NextResponse } from "next/server";
import { pngDoPix } from "@/lib/pix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const png = await pngDoPix();
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ erro: "indisponivel" }, { status: 500 });
  }
}
