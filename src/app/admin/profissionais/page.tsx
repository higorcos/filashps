import { prisma } from "@/lib/prisma";
import { EntityAdmin } from "@/components/admin/EntityAdmin";

export const dynamic = "force-dynamic";

export default async function ProfissionaisAdminPage() {
  const profissionais = await prisma.profissional.findMany({ orderBy: { nome: "asc" } });

  return (
    <EntityAdmin
      apiPath="/api/profissionais"
      items={profissionais}
      fields={[
        { key: "nome", label: "Nome" },
        { key: "registro", label: "CRM / Registro" },
      ]}
    />
  );
}
