import { NextRequest, NextResponse } from "next/server";
import { triagemSchema } from "@/lib/validation";
import { criarTriagemComFilas } from "@/lib/fila-service";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = triagemSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const resultado = await criarTriagemComFilas(parsed.data);
    return NextResponse.json(resultado, { status: 201 });
  } catch (err) {
    return respostaErro(err, "POST /api/triagem");
  }
}
