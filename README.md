# FilasHPS — Sistema de Gerenciamento de Filas Hospitalares

Sistema web para gerenciar filas de atendimento em múltiplas unidades de saúde: triagem com
priorização automática, painel do profissional para chamar pacientes, painel público (telão) com
anúncio por voz via Web Speech API, e histórico de tentativas de chamada.

## Stack

- **Next.js 16** (App Router) — frontend e API routes no mesmo projeto
- **Prisma 7** — ORM, com SQLite em desenvolvimento (via driver adapter `@prisma/adapter-better-sqlite3`)
- **Tailwind CSS 4** — estilo
- **zod** — validação de formulários e payloads de API
- **pino** — log estruturado em arquivo (`logs/app.log`), com captura de exceções não tratadas

O acesso ao banco é feito inteiramente via Prisma Client, então migrar para PostgreSQL ou MySQL no
futuro é só trocar o `provider`/`url` da datasource e o driver adapter (`@prisma/adapter-pg`,
`@prisma/adapter-mariadb`, etc.) — nenhuma query precisa ser reescrita.

## Pré-requisitos

- Node.js 20+
- npm

## Passo a passo para rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Copiar o arquivo de ambiente (a URL padrão já aponta para um arquivo SQLite local)
cp .env.example .env

# 3. Criar o banco e aplicar as migrations
npx prisma migrate dev

# 4. Popular o banco com dados de exemplo (unidades, especialidades, profissionais, pacientes)
npm run seed

# 5. Rodar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> Se você criou o repositório do zero (sem o `dev.db` já gerado), o passo 3 (`prisma migrate dev`)
> cria o arquivo `dev.db` na raiz do projeto e gera o Prisma Client em `src/generated/prisma`. Esse
> diretório gerado e o `dev.db` não são versionados (veja `.gitignore`).

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Sobe o servidor Next.js em modo desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run migrate` | Atalho para `prisma migrate dev` |
| `npm run seed` | Executa `prisma/seed.ts` (popula o banco; **apaga os dados atuais antes de recriar**) |
| `npm run lint` | ESLint |

### Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | Connection string do Prisma (SQLite em dev) |
| `TIMEOUT_CHAMADA_MINUTOS` | `3` | Minutos sem "Iniciar atendimento" até a chamada expirar automaticamente e o paciente voltar para a fila |
| `LOG_LEVEL` | `info` | Nível mínimo de log do pino |

## Estrutura do projeto

```
prisma/
  schema.prisma       # modelo de dados completo
  seed.ts             # dados de exemplo (2 unidades, 3 especialidades, 3 profissionais, 4 prioridades, 3 pacientes)
  migrations/
src/
  app/
    triagem/           # tela de triagem / cadastro
    medico/             # seleção de profissional + painel de chamada
    painel/[unidadeId]/ # painel público (telão) com SSE + voz
    admin/               # CRUD de unidades, profissionais, especialidades, prioridades, vínculos
    api/                 # route handlers (triagem, fila, vínculos, unidades, etc.)
  components/          # componentes de UI (client components)
  lib/
    fila-service.ts     # regras de negócio da fila (chamar, iniciar, finalizar, timeout)
    prisma.ts           # singleton do Prisma Client com o driver adapter do SQLite
    logger.ts            # logger pino (arquivo + console) e captura de exceções globais
    events.ts             # pub/sub em memória usado pelo SSE do painel público
    validation.ts          # schemas zod compartilhados entre client e API routes
  instrumentation.ts    # inicia a verificação automática de timeout ao subir o servidor
logs/
  app.log              # log estruturado (criado automaticamente)
```

## Regras de negócio implementadas

- **Múltiplas unidades**: cada unidade tem sua própria fila por especialidade; nada é compartilhado
  entre unidades.
- **Profissional em múltiplos vínculos**: a tabela `ProfissionalUnidadeEspecialidade` liga um
  profissional a N combinações de unidade + especialidade. A tela `/medico` deixa escolher qual
  vínculo está ativo na sessão.
- **Exclusão mútua entre especialidades**: a busca do "próximo da fila" (`fila-service.ts`) exclui
  qualquer paciente que já tenha outra senha em status `chamado` ou `em_atendimento`, em qualquer
  especialidade/unidade.
- **Ordenação**: peso da prioridade (decrescente) e depois ordem de chegada (`criadoEm` ascendente).
- **Prioridade automática por idade**: a partir de 60 anos a triagem sugere "Idoso" automaticamente
  (o atendente pode alterar antes de enviar).
- **Timeout automático de chamada**: um verificador em segundo plano (iniciado em
  `src/instrumentation.ts`) roda a cada 15s e reverte chamadas sem confirmação após
  `TIMEOUT_CHAMADA_MINUTOS` (padrão 3min), incrementando `tentativasChamada`.
- **Painel público em tempo real**: `/api/painel/eventos` expõe um stream SSE por unidade; a página
  usa a Web Speech API do navegador para anunciar cada nova chamada.

## Observação sobre "enums" no schema

SQLite não suporta o tipo `enum` nativo do Prisma. Por isso `Fila.status` e `Chamada.resultado` são
`String` no schema, com os valores válidos centralizados em `src/lib/constants.ts` e validados via
zod nas fronteiras da API. Ao migrar para PostgreSQL/MySQL isso pode virar um `enum` real do Prisma
sem alterar a lógica da aplicação.
