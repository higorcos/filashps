import { prisma } from "@/lib/prisma";
import { EntityAdmin } from "@/components/admin/EntityAdmin";

export const dynamic = "force-dynamic";

export default async function EspecialidadesAdminPage() {
  const especialidades = await prisma.especialidade.findMany({ orderBy: { nome: "asc" } });

  return (
    <EntityAdmin
      apiPath="/api/especialidades"
      items={especialidades}
      fields={[
        { key: "nome", label: "Nome" },
        { key: "codigoSenha", label: "Prefixo da senha (ex: C)" },
      ]}
    />
  );
}
