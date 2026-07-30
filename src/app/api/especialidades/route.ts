import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { especialidadeSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function GET() {
  const especialidades = await prisma.especialidade.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(especialidades);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = especialidadeSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const especialidade = await prisma.especialidade.create({ data: parsed.data });
    return NextResponse.json(especialidade, { status: 201 });
  } catch (err) {
    return respostaErro(err, "POST /api/especialidades");
  }
}
