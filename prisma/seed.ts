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
      data: { nome: "UPA Central", endereco: "Av. Principal, 1000 - Centro" },
    }),
    prisma.unidade.create({
      data: { nome: "UBS Jardim das Flores", endereco: "Rua das Flores, 250 - Jardim das Flores" },
    }),
  ]);

  const [clinicaGeral, cardiologia, pediatria] = await Promise.all([
    prisma.especialidade.create({ data: { nome: "Clínica Geral", codigoSenha: "G" } }),
    prisma.especialidade.create({ data: { nome: "Cardiologia", codigoSenha: "C" } }),
    prisma.especialidade.create({ data: { nome: "Pediatria", codigoSenha: "P" } }),
  ]);

  const [, idoso, gestante, urgencia] = await Promise.all([
    prisma.prioridade.create({ data: { nome: "Normal", peso: 0 } }),
    prisma.prioridade.create({ data: { nome: "Idoso", peso: 10 } }),
    prisma.prioridade.create({ data: { nome: "Gestante", peso: 10 } }),
    prisma.prioridade.create({ data: { nome: "Urgência", peso: 20 } }),
  ]);

  const [anaSouza, brunoLima, carlaMendes] = await Promise.all([
    prisma.profissional.create({ data: { nome: "Dra. Ana Souza", registro: "CRM 12345-SP" } }),
    prisma.profissional.create({ data: { nome: "Dr. Bruno Lima", registro: "CRM 54321-SP" } }),
    prisma.profissional.create({ data: { nome: "Dra. Carla Mendes", registro: "CRM 67890-SP" } }),
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
    data: { nomeCompleto: "Maria Oliveira Santos", dataNascimento: new Date("1955-03-10") },
  });
  const triagemMaria = await prisma.triagem.create({
    data: {
      pacienteId: maria.id,
      unidadeId: upaCentral.id,
      pressao: "138/86",
      glicemia: 102,
      pesoKg: 68.5,
      observacoes: "Queixa de dor de cabeça e tontura",
      criadoPor: "Recepção UPA Central",
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
    data: { nomeCompleto: "João Pedro Alves", dataNascimento: new Date("1990-07-22") },
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
      criadoPor: "Recepção UPA Central",
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
    data: { nomeCompleto: "Beatriz Fernandes Costa", dataNascimento: new Date("2001-01-15") },
  });
  const triagemBeatriz = await prisma.triagem.create({
    data: {
      pacienteId: beatriz.id,
      unidadeId: ubsJardim.id,
      pressao: "110/70",
      glicemia: 88,
      pesoKg: 61.0,
      observacoes: "Gestante, consulta de rotina",
      criadoPor: "Recepção UBS Jardim das Flores",
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
