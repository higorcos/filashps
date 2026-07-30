import { NextResponse } from "next/server";
import { chamarNovamente } from "@/lib/fila-service";
import { respostaErro } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const fila = await chamarNovamente(id);
    return NextResponse.json(fila);
  } catch (err) {
    return respostaErro(err, "POST /api/fila/[id]/chamar-novamente");
  }
}
