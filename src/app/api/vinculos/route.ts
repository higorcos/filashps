import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vinculoSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function GET() {
  const vinculos = await prisma.profissionalUnidadeEspecialidade.findMany({
    include: { profissional: true, unidade: true, especialidade: true },
    orderBy: [{ profissional: { nome: "asc" } }],
  });
  return NextResponse.json(vinculos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = vinculoSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const vinculo = await prisma.profissionalUnidadeEspecialidade.create({
      data: parsed.data,
      include: { profissional: true, unidade: true, especialidade: true },
    });
    return NextResponse.json(vinculo, { status: 201 });
  } catch (err) {
    return respostaErro(err, "POST /api/vinculos");
  }
}
