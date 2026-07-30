import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { logger } from "@/lib/logger";
import { FilaServiceError } from "@/lib/fila-service";
import { Prisma } from "@/generated/prisma/client";

export function respostaErro(err: unknown, rota: string) {
  if (err instanceof FilaServiceError) {
    return NextResponse.json({ erro: err.message }, { status: 409 });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return NextResponse.json({ erro: "Registro não encontrado" }, { status: 404 });
  }

  logger.error({ err, rota }, "Erro não tratado em rota da API");
  return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
}

export function respostaValidacao(error: ZodError) {
  return NextResponse.json({ erro: "Dados inválidos", detalhes: error.issues }, { status: 400 });
}
