import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [unidades, profissionais, especialidades, prioridades, vinculos] = await Promise.all([
    prisma.unidade.count(),
    prisma.profissional.count(),
    prisma.especialidade.count(),
    prisma.prioridade.count(),
    prisma.profissionalUnidadeEspecialidade.count(),
  ]);

  const itens = [
    { label: "Unidades", valor: unidades },
    { label: "Profissionais", valor: profissionais },
    { label: "Especialidades", valor: especialidades },
    { label: "Prioridades", valor: prioridades },
    { label: "Vínculos", valor: vinculos },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {itens.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-brand-950">{item.valor}</p>
          <p className="mt-1 text-sm text-slate-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
