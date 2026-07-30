export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { logger } = await import("@/lib/logger");
  const { iniciarVerificacaoDeTimeouts } = await import("@/lib/timeout-checker");

  logger.info("Servidor iniciado");
  iniciarVerificacaoDeTimeouts();
}
