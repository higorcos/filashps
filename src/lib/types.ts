export type FilaComDetalhes = {
  id: string;
  senha: string;
  status: string;
  tentativasChamada: number;
  sala: string | null;
  criadoEm: string;
  chamadoEm: string | null;
  atendidoEm: string | null;
  finalizadoEm: string | null;
  profissionalId: string | null;
  prioridade: { id: string; nome: string; peso: number };
  profissional: { id: string; nome: string } | null;
  triagem: {
    comorbidades: string | null;
    medicamentos: string | null;
    observacoes: string | null;
    pressao: string | null;
    glicemia: number | null;
    pesoKg: number | null;
    criadoPor: string;
    criadoEm: string;
    paciente: { id: string; nomeCompleto: string; dataNascimento: string };
  };
  chamadas: { id: string; chamadoEm: string; resultado: string }[];
};

export type FilaResposta = {
  aguardando: FilaComDetalhes[];
  emAndamento: FilaComDetalhes[];
};
