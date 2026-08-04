import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { formatarSenha } from "../src/lib/senha";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function limparBanco() {
  await prisma.chamada.deleteMany();
  await prisma.fila.deleteMany();
  await prisma.triagem.deleteMany();
  await prisma.profissionalUnidadeEspecialidade.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.profissional.deleteMany();
  await prisma.especialidade.deleteMany();
  await prisma.prioridade.deleteMany();
}

async function main() {
  await limparBanco();

  const [upaCentral, ubsJardim] = await Promise.all([
    prisma.unidade.create({
      data: { nome: "UPA CENTRAL", endereco: "Av. Principal, 1000 - Centro" },
    }),
    prisma.unidade.create({
      data: { nome: "UBS JARDIM DAS FLORES", endereco: "Rua das Flores, 250 - Jardim das Flores" },
    }),
  ]);

  const [clinicaGeral, cardiologia, pediatria] = await Promise.all([
    prisma.especialidade.create({ data: { nome: "CLÍNICA GERAL", codigoSenha: "G" } }),
    prisma.especialidade.create({ data: { nome: "CARDIOLOGIA", codigoSenha: "C" } }),
    prisma.especialidade.create({ data: { nome: "PEDIATRIA", codigoSenha: "P" } }),
  ]);

  const [, idoso, gestante, urgencia] = await Promise.all([
    prisma.prioridade.create({ data: { nome: "NORMAL", peso: 0 } }),
    prisma.prioridade.create({ data: { nome: "IDOSO", peso: 10 } }),
    prisma.prioridade.create({ data: { nome: "GESTANTE", peso: 10 } }),
    prisma.prioridade.create({ data: { nome: "URGÊNCIA", peso: 20 } }),
  ]);

  const [anaSouza, brunoLima, carlaMendes] = await Promise.all([
    prisma.profissional.create({ data: { nome: "DRA. ANA SOUZA", registro: "CRM 12345-SP" } }),
    prisma.profissional.create({ data: { nome: "DR. BRUNO LIMA", registro: "CRM 54321-SP" } }),
    prisma.profissional.create({ data: { nome: "DRA. CARLA MENDES", registro: "CRM 67890-SP" } }),
  ]);

  // Ana atua em duas especialidades na mesma unidade
  await prisma.profissionalUnidadeEspecialidade.create({
    data: { profissionalId: anaSouza.id, unidadeId: upaCentral.id, especialidadeId: clinicaGeral.id },
  });
  await prisma.profissionalUnidadeEspecialidade.create({
    data: { profissionalId: anaSouza.id, unidadeId: upaCentral.id, especialidadeId: cardiologia.id },
  });

  // Bruno atua na mesma especialidade em duas unidades diferentes
  await prisma.profissionalUnidadeEspecialidade.create({
    data: { profissionalId: brunoLima.id, unidadeId: upaCentral.id, especialidadeId: cardiologia.id },
  });
  await prisma.profissionalUnidadeEspecialidade.create({
    data: { profissionalId: brunoLima.id, unidadeId: ubsJardim.id, especialidadeId: cardiologia.id },
  });

  // Carla atua apenas na UBS, em pediatria
  await prisma.profissionalUnidadeEspecialidade.create({
    data: { profissionalId: carlaMendes.id, unidadeId: ubsJardim.id, especialidadeId: pediatria.id },
  });

  // Paciente 1: idosa aguardando na Clínica Geral (UPA Central)
  const maria = await prisma.paciente.create({
    data: { nomeCompleto: "MARIA OLIVEIRA SANTOS", dataNascimento: new Date("1955-03-10"), telefone: "(11) 98765-4321" },
  });
  const triagemMaria = await prisma.triagem.create({
    data: {
      pacienteId: maria.id,
      unidadeId: upaCentral.id,
      pressao: "138/86",
      glicemia: 102,
      pesoKg: 68.5,
      observacoes: "Queixa de dor de cabeça e tontura",
      criadoPor: "RECEPÇÃO UPA CENTRAL",
    },
  });
  await prisma.fila.create({
    data: {
      triagemId: triagemMaria.id,
      especialidadeId: clinicaGeral.id,
      prioridadeId: idoso.id,
      senha: formatarSenha(clinicaGeral.codigoSenha, 1),
      status: "aguardando",
    },
  });

  // Paciente 2: em urgência, já chamado para Cardiologia (UPA Central)
  const joao = await prisma.paciente.create({
    data: { nomeCompleto: "JOÃO PEDRO ALVES", dataNascimento: new Date("1990-07-22"), telefone: "(11) 91234-5678" },
  });
  const triagemJoao = await prisma.triagem.create({
    data: {
      pacienteId: joao.id,
      unidadeId: upaCentral.id,
      pressao: "150/95",
      glicemia: 110,
      pesoKg: 89.2,
      comorbidades: "Hipertensão",
      observacoes: "Dor no peito",
      criadoPor: "RECEPÇÃO UPA CENTRAL",
    },
  });
  const filaJoao = await prisma.fila.create({
    data: {
      triagemId: triagemJoao.id,
      especialidadeId: cardiologia.id,
      prioridadeId: urgencia.id,
      senha: formatarSenha(cardiologia.codigoSenha, 1),
      status: "chamado",
      profissionalId: anaSouza.id,
      sala: "Consultório 1",
      chamadoEm: new Date(),
    },
  });
  await prisma.chamada.create({
    data: { filaId: filaJoao.id, resultado: "pendente" },
  });

  // Paciente 3: atendimento já finalizado na Cardiologia (UBS Jardim das Flores)
  const beatriz = await prisma.paciente.create({
    data: { nomeCompleto: "BEATRIZ FERNANDES COSTA", dataNascimento: new Date("2001-01-15"), telefone: "(11) 99876-5432" },
  });
  const triagemBeatriz = await prisma.triagem.create({
    data: {
      pacienteId: beatriz.id,
      unidadeId: ubsJardim.id,
      pressao: "110/70",
      glicemia: 88,
      pesoKg: 61.0,
      observacoes: "Gestante, consulta de rotina",
      criadoPor: "RECEPÇÃO UBS JARDIM DAS FLORES",
    },
  });
  const chamadoEmBeatriz = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const atendidoEmBeatriz = new Date(chamadoEmBeatriz.getTime() + 5 * 60 * 1000);
  const finalizadoEmBeatriz = new Date(atendidoEmBeatriz.getTime() + 20 * 60 * 1000);
  const filaBeatriz = await prisma.fila.create({
    data: {
      triagemId: triagemBeatriz.id,
      especialidadeId: cardiologia.id,
      prioridadeId: gestante.id,
      senha: formatarSenha(cardiologia.codigoSenha, 1),
      status: "finalizado",
      profissionalId: brunoLima.id,
      sala: "Sala 2",
      chamadoEm: chamadoEmBeatriz,
      atendidoEm: atendidoEmBeatriz,
      finalizadoEm: finalizadoEmBeatriz,
    },
  });
  await prisma.chamada.create({
    data: { filaId: filaBeatriz.id, chamadoEm: chamadoEmBeatriz, resultado: "compareceu" },
  });

  console.log("Seed concluído:");
  console.log(`- Unidades: UPA Central, UBS Jardim das Flores`);
  console.log(`- Especialidades: Clínica Geral, Cardiologia, Pediatria`);
  console.log(`- Profissionais: Ana Souza (2 vínculos), Bruno Lima (2 unidades), Carla Mendes`);
  console.log(`- Pacientes: Maria (aguardando), João (chamado), Beatriz (finalizado)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
