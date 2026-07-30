import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { emitirEventoPainel } from "@/lib/events";
import { formatarSenha } from "@/lib/senha";
import { CHAMADA_RESULTADO, FILA_STATUS, TIMEOUT_CHAMADA_MINUTOS } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";
import type { TriagemInput } from "@/lib/validation";

type Tx = Prisma.TransactionClient;

async function proximoNumeroSenha(tx: Tx, unidadeId: string, especialidadeId: string): Promise<number> {
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  const total = await tx.fila.count({
    where: {
      especialidadeId,
      criadoEm: { gte: inicioDoDia },
      triagem: { unidadeId },
    },
  });

  return total + 1;
}

export async function criarTriagemComFilas(input: TriagemInput) {
  return prisma.$transaction(async (tx) => {
    const paciente = await tx.paciente.create({
      data: {
        nomeCompleto: input.nomeCompleto,
        dataNascimento: input.dataNascimento,
      },
    });

    const triagem = await tx.triagem.create({
      data: {
        pacienteId: paciente.id,
        unidadeId: input.unidadeId,
        comorbidades: input.comorbidades || null,
        medicamentos: input.medicamentos || null,
        observacoes: input.observacoes || null,
        pressao: input.pressao || null,
        glicemia: input.glicemia ?? null,
        criadoPor: input.criadoPor,
      },
    });

    const filas = [];
    for (const especialidadeId of input.especialidadeIds) {
      const especialidade = await tx.especialidade.findUniqueOrThrow({ where: { id: especialidadeId } });
      const numero = await proximoNumeroSenha(tx, input.unidadeId, especialidadeId);

      const fila = await tx.fila.create({
        data: {
          triagemId: triagem.id,
          especialidadeId,
          prioridadeId: input.prioridadeId,
          senha: formatarSenha(especialidade.codigoSenha, numero),
        },
        include: { especialidade: true, prioridade: true },
      });
      filas.push(fila);
    }

    logger.info({ pacienteId: paciente.id, senhas: filas.map((f) => f.senha) }, "Triagem registrada");

    return { paciente, triagem, filas };
  });
}

export async function obterFila(unidadeId: string, especialidadeId: string) {
  const registros = await prisma.fila.findMany({
    where: {
      especialidadeId,
      status: { in: [FILA_STATUS.AGUARDANDO, FILA_STATUS.CHAMADO, FILA_STATUS.EM_ATENDIMENTO] },
      triagem: { unidadeId },
    },
    include: {
      prioridade: true,
      profissional: true,
      triagem: { include: { paciente: true } },
      chamadas: { orderBy: { chamadoEm: "desc" }, take: 5 },
    },
  });

  const aguardando = registros
    .filter((f) => f.status === FILA_STATUS.AGUARDANDO)
    .sort((a, b) => b.prioridade.peso - a.prioridade.peso || a.criadoEm.getTime() - b.criadoEm.getTime());

  const emAndamento = registros
    .filter((f) => f.status !== FILA_STATUS.AGUARDANDO)
    .sort((a, b) => (b.chamadoEm?.getTime() ?? 0) - (a.chamadoEm?.getTime() ?? 0));

  return { aguardando, emAndamento };
}

async function pacientesComAtendimentoAtivo(tx: Tx): Promise<Set<string>> {
  const ativos = await tx.fila.findMany({
    where: { status: { in: [FILA_STATUS.CHAMADO, FILA_STATUS.EM_ATENDIMENTO] } },
    select: { triagem: { select: { pacienteId: true } } },
  });
  return new Set(ativos.map((f) => f.triagem.pacienteId));
}

async function proximoElegivel(tx: Tx, unidadeId: string, especialidadeId: string) {
  const pacientesAtivos = await pacientesComAtendimentoAtivo(tx);

  const candidatos = await tx.fila.findMany({
    where: { especialidadeId, status: FILA_STATUS.AGUARDANDO, triagem: { unidadeId } },
    include: { prioridade: true, triagem: { include: { paciente: true } } },
  });

  const elegiveis = candidatos.filter((f) => !pacientesAtivos.has(f.triagem.pacienteId));
  elegiveis.sort((a, b) => b.prioridade.peso - a.prioridade.peso || a.criadoEm.getTime() - b.criadoEm.getTime());

  return elegiveis[0] ?? null;
}

async function resolverChamadaPendente(tx: Tx, filaId: string, resultado: (typeof CHAMADA_RESULTADO)[keyof typeof CHAMADA_RESULTADO]) {
  await tx.chamada.updateMany({
    where: { filaId, resultado: CHAMADA_RESULTADO.PENDENTE },
    data: { resultado },
  });
}

function notificarPainel(fila: {
  id: string;
  senha: string;
  sala: string | null;
  chamadoEm: Date | null;
  especialidade: { nome: string };
  triagem: { unidadeId: string; paciente: { nomeCompleto: string } };
}) {
  emitirEventoPainel({
    tipo: "chamada",
    unidadeId: fila.triagem.unidadeId,
    filaId: fila.id,
    senha: fila.senha,
    sala: fila.sala,
    especialidade: fila.especialidade.nome,
    pacienteNome: fila.triagem.paciente.nomeCompleto,
    chamadoEm: (fila.chamadoEm ?? new Date()).toISOString(),
  });
}

export class FilaServiceError extends Error {}

export async function chamarProximo(params: {
  unidadeId: string;
  especialidadeId: string;
  profissionalId: string;
  sala?: string | null;
}) {
  const fila = await prisma.$transaction(async (tx) => {
    const proximo = await proximoElegivel(tx, params.unidadeId, params.especialidadeId);
    if (!proximo) return null;

    await resolverChamadaPendente(tx, proximo.id, CHAMADA_RESULTADO.NAO_COMPARECEU);
    await tx.chamada.create({ data: { filaId: proximo.id, resultado: CHAMADA_RESULTADO.PENDENTE } });

    return tx.fila.update({
      where: { id: proximo.id },
      data: {
        status: FILA_STATUS.CHAMADO,
        chamadoEm: new Date(),
        profissionalId: params.profissionalId,
        sala: params.sala || null,
      },
      include: { especialidade: true, triagem: { include: { paciente: true } } },
    });
  });

  if (fila) {
    notificarPainel(fila);
    logger.info({ filaId: fila.id, senha: fila.senha }, "Paciente chamado");
  }

  return fila;
}

export async function chamarNovamente(filaId: string, sala?: string) {
  const fila = await prisma.$transaction(async (tx) => {
    const atual = await tx.fila.findUniqueOrThrow({ where: { id: filaId } });
    if (atual.status !== FILA_STATUS.CHAMADO) {
      throw new FilaServiceError("Só é possível chamar novamente uma senha que já foi chamada.");
    }

    await resolverChamadaPendente(tx, filaId, CHAMADA_RESULTADO.NAO_COMPARECEU);
    await tx.chamada.create({ data: { filaId, resultado: CHAMADA_RESULTADO.PENDENTE } });

    return tx.fila.update({
      where: { id: filaId },
      data: {
        chamadoEm: new Date(),
        ...(sala !== undefined ? { sala: sala || null } : {}),
      },
      include: { especialidade: true, triagem: { include: { paciente: true } } },
    });
  });

  notificarPainel(fila);
  logger.info({ filaId, senha: fila.senha }, "Paciente chamado novamente");

  return fila;
}

export async function iniciarAtendimento(filaId: string) {
  return prisma.$transaction(async (tx) => {
    const atual = await tx.fila.findUniqueOrThrow({ where: { id: filaId } });
    if (atual.status !== FILA_STATUS.CHAMADO) {
      throw new FilaServiceError("Só é possível iniciar o atendimento de uma senha chamada.");
    }

    await resolverChamadaPendente(tx, filaId, CHAMADA_RESULTADO.COMPARECEU);

    return tx.fila.update({
      where: { id: filaId },
      data: { status: FILA_STATUS.EM_ATENDIMENTO, atendidoEm: new Date() },
    });
  });
}

export async function finalizarAtendimento(filaId: string) {
  return prisma.$transaction(async (tx) => {
    const atual = await tx.fila.findUniqueOrThrow({ where: { id: filaId } });
    if (atual.status !== FILA_STATUS.EM_ATENDIMENTO && atual.status !== FILA_STATUS.CHAMADO) {
      throw new FilaServiceError("Só é possível finalizar uma senha chamada ou em atendimento.");
    }

    return tx.fila.update({
      where: { id: filaId },
      data: { status: FILA_STATUS.FINALIZADO, finalizadoEm: new Date() },
    });
  });
}

export async function verificarTimeouts() {
  const limite = new Date(Date.now() - TIMEOUT_CHAMADA_MINUTOS * 60_000);

  const expirados = await prisma.fila.findMany({
    where: { status: FILA_STATUS.CHAMADO, chamadoEm: { lte: limite } },
  });

  for (const fila of expirados) {
    await prisma.$transaction(async (tx) => {
      await resolverChamadaPendente(tx, fila.id, CHAMADA_RESULTADO.NAO_COMPARECEU);
      await tx.fila.update({
        where: { id: fila.id },
        data: {
          status: FILA_STATUS.AGUARDANDO,
          profissionalId: null,
          sala: null,
          chamadoEm: null,
          tentativasChamada: { increment: 1 },
        },
      });
    });
    logger.warn({ filaId: fila.id, senha: fila.senha }, "Chamada expirou por timeout — paciente não compareceu");
  }

  return expirados.length;
}
