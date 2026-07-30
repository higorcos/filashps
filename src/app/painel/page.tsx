import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SelecaoPainelPage() {
  const unidades = await prisma.unidade.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel público</h1>
      <p className="mt-1 text-sm text-slate-600">Escolha a unidade para exibir no telão.</p>

      <div className="mt-8 space-y-3">
        {unidades.map((u) => (
          <Link
            key={u.id}
            href={`/painel/${u.id}`}
            className="block rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <p className="text-base font-semibold text-slate-900">{u.nome}</p>
            <p className="text-sm text-slate-500">{u.endereco}</p>
          </Link>
        ))}
        {unidades.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma unidade cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}
