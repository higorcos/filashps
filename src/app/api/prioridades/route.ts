import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prioridadeSchema } from "@/lib/validation";
import { respostaErro, respostaValidacao } from "@/lib/api-helpers";

export async function GET() {
  const prioridades = await prisma.prioridade.findMany({ orderBy: { peso: "desc" } });
  return NextResponse.json(prioridades);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = prioridadeSchema.safeParse(body);
    if (!parsed.success) return respostaValidacao(parsed.error);

    const prioridade = await prisma.prioridade.create({ data: parsed.data });
    return NextResponse.json(prioridade, { status: 201 });
  } catch (err) {
    return respostaErro(err, "POST /api/prioridades");
  }
}
