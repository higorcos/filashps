import { prisma } from "@/lib/prisma";
import { VinculosAdmin } from "@/components/admin/VinculosAdmin";

export const dynamic = "force-dynamic";

export default async function VinculosAdminPage() {
  const [vinculos, profissionais, unidades, especialidades] = await Promise.all([
    prisma.profissionalUnidadeEspecialidade.findMany({
      include: { profissional: true, unidade: true, especialidade: true },
      orderBy: [{ profissional: { nome: "asc" } }],
    }),
    prisma.profissional.findMany({ orderBy: { nome: "asc" } }),
    prisma.unidade.findMany({ orderBy: { nome: "asc" } }),
    prisma.especialidade.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <VinculosAdmin
      vinculos={vinculos}
      profissionais={profissionais}
      unidades={unidades}
      especialidades={especialidades}
    />
  );
}
