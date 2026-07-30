import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { assinarEventosPainel, type PainelEvento } from "@/lib/events";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

async function obterHistorico(unidadeId: string) {
  const chamadas = await prisma.chamada.findMany({
    where: { fila: { triagem: { unidadeId } } },
    orderBy: { chamadoEm: "desc" },
    take: 10,
    include: { fila: { include: { especialidade: true } } },
  });

  return chamadas.map((c) => ({
    tipo: "chamada" as const,
    unidadeId,
    filaId: c.filaId,
    senha: c.fila.senha,
    sala: c.fila.sala,
    especialidade: c.fila.especialidade.nome,
    chamadoEm: c.chamadoEm.toISOString(),
  }));
}

export async function GET(request: NextRequest) {
  const unidadeId = request.nextUrl.searchParams.get("unidadeId");

  if (!unidadeId) {
    return new Response("Informe unidadeId", { status: 400 });
  }

  const encoder = new TextEncoder();

  function formatarEvento(nome: string, dados: unknown) {
    return encoder.encode(`event: ${nome}\ndata: ${JSON.stringify(dados)}\n\n`);
  }

  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const historico = await obterHistorico(unidadeId);
        controller.enqueue(formatarEvento("historico", historico));
      } catch (err) {
        logger.error({ err }, "Falha ao carregar histórico inicial do painel");
      }

      const listener = (evento: PainelEvento) => {
        controller.enqueue(formatarEvento("chamada", evento));
      };
      unsubscribe = assinarEventosPainel(unidadeId, listener);

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 25_000);
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  request.signal.addEventListener("abort", () => {
    unsubscribe?.();
    if (heartbeat) clearInterval(heartbeat);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
