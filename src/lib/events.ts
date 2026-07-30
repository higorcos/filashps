import { EventEmitter } from "node:events";

export type PainelEvento = {
  tipo: "chamada";
  unidadeId: string;
  filaId: string;
  senha: string;
  sala: string | null;
  especialidade: string;
  pacienteNome: string;
  chamadoEm: string;
};

declare global {
  var __filasHpsEventBus: EventEmitter | undefined;
}

export const painelEventBus = globalThis.__filasHpsEventBus ?? new EventEmitter();
painelEventBus.setMaxListeners(0);

if (process.env.NODE_ENV !== "production") {
  globalThis.__filasHpsEventBus = painelEventBus;
}

function canal(unidadeId: string) {
  return `unidade:${unidadeId}`;
}

export function emitirEventoPainel(evento: PainelEvento) {
  painelEventBus.emit(canal(evento.unidadeId), evento);
}

export function assinarEventosPainel(unidadeId: string, listener: (evento: PainelEvento) => void) {
  painelEventBus.on(canal(unidadeId), listener);
  return () => painelEventBus.off(canal(unidadeId), listener);
}
