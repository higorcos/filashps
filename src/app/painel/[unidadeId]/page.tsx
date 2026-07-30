import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PainelPublico } from "@/components/PainelPublico";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ unidadeId: string }> };

export default async function PainelUnidadePage({ params }: Params) {
  const { unidadeId } = await params;
  const unidade = await prisma.unidade.findUnique({ where: { id: unidadeId } });

  if (!unidade) notFound();

  return <PainelPublico unidadeId={unidade.id} unidadeNome={unidade.nome} />;
}
