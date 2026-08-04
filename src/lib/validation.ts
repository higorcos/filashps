import { z } from "zod";

export const pressaoRegex = /^\d{2,3}\/\d{2,3}$/;

export const triagemSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(1, "Nome completo é obrigatório")
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Informe nome e sobrenome",
    })
    .toUpperCase(),
  telefone: z.string().trim().optional(),
  dataNascimento: z.coerce
    .date({ error: "Data de nascimento é obrigatória" })
    .max(new Date(), { error: "Data de nascimento não pode ser no futuro" }),
  unidadeId: z.string().min(1, "Selecione a unidade"),
  especialidadeIds: z.array(z.string().min(1)).min(1, "Selecione ao menos uma especialidade"),
  prioridadeId: z.string().min(1, "Selecione a prioridade"),
  comorbidades: z.string().trim().optional(),
  medicamentos: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
  pressao: z
    .string()
    .trim()
    .regex(pressaoRegex, { error: "Formato esperado: 120/80" })
    .optional()
    .or(z.literal("")),
  glicemia: z.coerce.number().int().optional(),
  pesoKg: z.coerce.number().positive().optional(),
  criadoPor: z.string().trim().min(1, "Informe quem realizou a triagem").toUpperCase(),
});

export type TriagemInput = z.infer<typeof triagemSchema>;

export const unidadeSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").toUpperCase(),
  endereco: z.string().trim().min(1, "Endereço é obrigatório"),
});

export const profissionalSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").toUpperCase(),
  registro: z.string().trim().min(1, "Registro/CRM é obrigatório"),
});

export const especialidadeSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").toUpperCase(),
  codigoSenha: z
    .string()
    .trim()
    .min(1, "Informe um prefixo")
    .max(3, "Use no máximo 3 caracteres")
    .toUpperCase(),
});

export const prioridadeSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").toUpperCase(),
  peso: z.coerce.number().int().min(0, "Peso deve ser maior ou igual a 0"),
});

export const vinculoSchema = z.object({
  profissionalId: z.string().min(1, "Selecione o profissional"),
  unidadeId: z.string().min(1, "Selecione a unidade"),
  especialidadeId: z.string().min(1, "Selecione a especialidade"),
});

export const chamarProximoSchema = z.object({
  unidadeId: z.string().min(1),
  especialidadeId: z.string().min(1),
  profissionalId: z.string().min(1),
  sala: z.string().trim().optional(),
});

export const chamarNovamenteSchema = z.object({
  sala: z.string().trim().optional(),
});
