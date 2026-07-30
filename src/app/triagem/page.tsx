import { prisma } from "@/lib/prisma";
import { TriagemForm } from "@/components/TriagemForm";

export const dynamic = "force-dynamic";

export default async function TriagemPage() {
  const [unidades, especialidades, prioridades, vinculos] = await Promise.all([
    prisma.unidade.findMany({ orderBy: { nome: "asc" } }),
    prisma.especialidade.findMany({ orderBy: { nome: "asc" } }),
    prisma.prioridade.findMany({ orderBy: { peso: "desc" } }),
    prisma.profissionalUnidadeEspecialidade.findMany({
      select: { unidadeId: true, especialidadeId: true },
      distinct: ["unidadeId", "especialidadeId"],
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-brand-950">Triagem / Cadastro</h1>
      <p className="mt-1 text-sm text-slate-600">
        Registre o paciente, colete os sinais vitais e gere a senha de atendimento.
      </p>

      <div className="mt-8">
        <TriagemForm
          unidades={unidades}
          especialidades={especialidades}
          prioridades={prioridades}
          vinculos={vinculos}
        />
      </div>
    </div>
  );
}
