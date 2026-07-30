import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { respostaErro } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.profissionalUnidadeEspecialidade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return respostaErro(err, "DELETE /api/vinculos/[id]");
  }
}
