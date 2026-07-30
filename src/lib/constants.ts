export const FILA_STATUS = {
  AGUARDANDO: "aguardando",
  CHAMADO: "chamado",
  EM_ATENDIMENTO: "em_atendimento",
  FINALIZADO: "finalizado",
  CANCELADO: "cancelado",
} as const;

export type FilaStatus = (typeof FILA_STATUS)[keyof typeof FILA_STATUS];

export const CHAMADA_RESULTADO = {
  COMPARECEU: "compareceu",
  NAO_COMPARECEU: "nao_compareceu",
  PENDENTE: "pendente",
} as const;

export type ChamadaResultado = (typeof CHAMADA_RESULTADO)[keyof typeof CHAMADA_RESULTADO];

export const TIMEOUT_CHAMADA_MINUTOS = Number(process.env.TIMEOUT_CHAMADA_MINUTOS ?? 3);

export const GLICEMIA_MIN = 20;
export const GLICEMIA_MAX = 600;

export const IDADE_PRIORIDADE_IDOSO = 60;
