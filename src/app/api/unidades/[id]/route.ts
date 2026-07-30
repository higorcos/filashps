import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unidadeSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = unidadeSchema.partial().safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const unidade = await prisma.unidade.update({ where: { id }, data: parsed.data });
    return NextResponse.json(unidade);
  } catch (err) {
    return respostaErro(err, "PATCH /api/unidades/[id]");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.unidade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return respostaErro(err, "DELETE /api/unidades/[id]");
  }
}
