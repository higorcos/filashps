import { NextResponse } from "next/server";
import { iniciarAtendimento } from "@/lib/fila-service";
import { respostaErro } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const fila = await iniciarAtendimento(id);
    return NextResponse.json(fila);
  } catch (err) {
    return respostaErro(err, "POST /api/fila/[id]/iniciar");
  }
}
