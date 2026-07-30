import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prioridadeSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = prioridadeSchema.partial().safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const prioridade = await prisma.prioridade.update({ where: { id }, data: parsed.data });
    return NextResponse.json(prioridade);
  } catch (err) {
    return respostaErro(err, "PATCH /api/prioridades/[id]");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.prioridade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return respostaErro(err, "DELETE /api/prioridades/[id]");
  }
}
