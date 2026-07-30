import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profissionalSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function GET() {
  const profissionais = await prisma.profissional.findMany({
    orderBy: { nome: "asc" },
    include: {
      vinculos: { include: { unidade: true, especialidade: true } },
    },
  });
  return NextResponse.json(profissionais);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profissionalSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const profissional = await prisma.profissional.create({ data: parsed.data });
    return NextResponse.json(profissional, { status: 201 });
  } catch (err) {
    return respostaErro(err, "POST /api/profissionais");
  }
}
