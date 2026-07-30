import { NextResponse } from "next/server";
import { chamarNovamente } from "@/lib/fila-service";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";
import { chamarNovamenteSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = chamarNovamenteSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const fila = await chamarNovamente(id, parsed.data.sala);
    return NextResponse.json(fila);
  } catch (err) {
    return respostaErro(err, "POST /api/fila/[id]/chamar-novamente");
  }
}
