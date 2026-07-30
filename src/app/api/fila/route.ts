import { NextRequest, NextResponse } from "next/server";
import { obterFila } from "@/lib/fila-service";
import { respostaErro } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const unidadeId = request.nextUrl.searchParams.get("unidadeId");
  const especialidadeId = request.nextUrl.searchParams.get("especialidadeId");

  if (!unidadeId || !especialidadeId) {
    return NextResponse.json({ erro: "Informe unidadeId e especialidadeId" }, { status: 400 });
  }

  try {
    const fila = await obterFila(unidadeId, especialidadeId);
    return NextResponse.json(fila);
  } catch (err) {
    return respostaErro(err, "GET /api/fila");
  }
}
