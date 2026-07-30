import { verificarTimeouts } from "@/lib/fila-service";
import { logger } from "@/lib/logger";

declare global {
  var __filasHpsTimeoutInterval: ReturnType<typeof setInterval> | undefined;
}

const INTERVALO_VERIFICACAO_MS = 15_000;

export function iniciarVerificacaoDeTimeouts() {
  if (globalThis.__filasHpsTimeoutInterval) return;

  globalThis.__filasHpsTimeoutInterval = setInterval(() => {
    verificarTimeouts().catch((err: unknown) => {
      logger.error({ err }, "Falha ao verificar timeouts de chamada");
    });
  }, INTERVALO_VERIFICACAO_MS);

  logger.info(
    { intervaloMs: INTERVALO_VERIFICACAO_MS },
    "Verificação automática de timeout de chamadas iniciada",
  );
}
