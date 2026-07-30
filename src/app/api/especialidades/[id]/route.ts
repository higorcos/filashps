import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { especialidadeSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = especialidadeSchema.partial().safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const especialidade = await prisma.especialidade.update({ where: { id }, data: parsed.data });
    return NextResponse.json(especialidade);
  } catch (err) {
    return respostaErro(err, "PATCH /api/especialidades/[id]");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.especialidade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return respostaErro(err, "DELETE /api/especialidades/[id]");
  }
}
