import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SelecaoPainelPage() {
  const unidades = await prisma.unidade.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Voltar ao início
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-950">Painel público</h1>
      <p className="mt-1 text-sm text-brand-700/70">Escolha a unidade para exibir no telão.</p>

      <div className="mt-8 space-y-3">
        {unidades.map((u) => (
          <Link
            key={u.id}
            href={`/painel/${u.id}`}
            className="block rounded-xl border border-brand-100 bg-white px-5 py-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <p className="text-base font-semibold text-brand-950">{u.nome}</p>
            <p className="text-sm text-brand-700/70">{u.endereco}</p>
          </Link>
        ))}
        {unidades.length === 0 && (
          <p className="text-sm text-brand-700/70">Nenhuma unidade cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}
