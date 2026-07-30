import { prisma } from "@/lib/prisma";
import { EntityAdmin } from "@/components/admin/EntityAdmin";

export const dynamic = "force-dynamic";

export default async function UnidadesAdminPage() {
  const unidades = await prisma.unidade.findMany({ orderBy: { nome: "asc" } });

  return (
    <EntityAdmin
      apiPath="/api/unidades"
      items={unidades}
      fields={[
        { key: "nome", label: "Nome" },
        { key: "endereco", label: "Endereço" },
      ]}
    />
  );
}
