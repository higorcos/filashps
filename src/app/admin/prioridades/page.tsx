import { prisma } from "@/lib/prisma";
import { EntityAdmin } from "@/components/admin/EntityAdmin";

export const dynamic = "force-dynamic";

export default async function PrioridadesAdminPage() {
  const prioridades = await prisma.prioridade.findMany({ orderBy: { peso: "desc" } });

  return (
    <EntityAdmin
      apiPath="/api/prioridades"
      items={prioridades}
      fields={[
        { key: "nome", label: "Nome" },
        { key: "peso", label: "Peso", type: "number" },
      ]}
    />
  );
}
