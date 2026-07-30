import { NextRequest, NextResponse } from "next/server";
import { chamarProximoSchema } from "@/lib/validation";
import { chamarProximo } from "@/lib/fila-service";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chamarProximoSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const fila = await chamarProximo(parsed.data);
    if (!fila) {
      return NextResponse.json({ erro: "Não há pacientes elegíveis aguardando nessa fila" }, { status: 404 });
    }

    return NextResponse.json(fila);
  } catch (err) {
    return respostaErro(err, "POST /api/fila/chamar");
  }
}
