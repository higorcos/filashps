-- CreateTable
CREATE TABLE "unidades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "registro" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "codigoSenha" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "profissional_unidade_especialidade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profissionalId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "especialidadeId" TEXT NOT NULL,
    CONSTRAINT "profissional_unidade_especialidade_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profissional_unidade_especialidade_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profissional_unidade_especialidade_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "especialidades" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeCompleto" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "triagens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "comorbidades" TEXT,
    "medicamentos" TEXT,
    "observacoes" TEXT,
    "pressao" TEXT,
    "glicemia" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoPor" TEXT NOT NULL,
    CONSTRAINT "triagens_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "triagens_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prioridades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "peso" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "filas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "triagemId" TEXT NOT NULL,
    "especialidadeId" TEXT NOT NULL,
    "prioridadeId" TEXT NOT NULL,
    "profissionalId" TEXT,
    "senha" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "tentativasChamada" INTEGER NOT NULL DEFAULT 0,
    "sala" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chamadoEm" DATETIME,
    "atendidoEm" DATETIME,
    "finalizadoEm" DATETIME,
    CONSTRAINT "filas_triagemId_fkey" FOREIGN KEY ("triagemId") REFERENCES "triagens" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "filas_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "especialidades" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "filas_prioridadeId_fkey" FOREIGN KEY ("prioridadeId") REFERENCES "prioridades" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "filas_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionais" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chamadas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filaId" TEXT NOT NULL,
    "chamadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" TEXT NOT NULL DEFAULT 'pendente',
    CONSTRAINT "chamadas_filaId_fkey" FOREIGN KEY ("filaId") REFERENCES "filas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_codigoSenha_key" ON "especialidades"("codigoSenha");

-- CreateIndex
CREATE UNIQUE INDEX "profissional_unidade_especialidade_profissionalId_unidadeId_especialidadeId_key" ON "profissional_unidade_especialidade"("profissionalId", "unidadeId", "especialidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "prioridades_nome_key" ON "prioridades"("nome");

-- CreateIndex
CREATE INDEX "filas_especialidadeId_status_idx" ON "filas"("especialidadeId", "status");

-- CreateIndex
CREATE INDEX "filas_status_idx" ON "filas"("status");
