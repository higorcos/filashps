import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unidadeSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function GET() {
  const unidades = await prisma.unidade.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(unidades);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = unidadeSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const unidade = await prisma.unidade.create({ data: parsed.data });
    return NextResponse.json(unidade, { status: 201 });
  } catch (err) {
    return respostaErro(err, "POST /api/unidades");
  }
}
