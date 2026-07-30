import { prisma } from "@/lib/prisma";
import { MedicoSelecao } from "@/components/MedicoSelecao";

export const dynamic = "force-dynamic";

export default async function MedicoPage() {
  const vinculos = await prisma.profissionalUnidadeEspecialidade.findMany({
    include: { profissional: true, unidade: true, especialidade: true },
    orderBy: [{ profissional: { nome: "asc" } }],
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel do profissional</h1>
      <p className="mt-1 text-sm text-slate-600">
        Selecione quem você é e em qual unidade/especialidade você está atuando agora.
      </p>

      <div className="mt-8">
        <MedicoSelecao vinculos={vinculos} />
      </div>
    </div>
  );
}
